"""Celery async worker queue for TailorFit AI scans.

Runs the heavy PyTorch/GPU reconstruction pipeline out-of-band, uploads the
exported GLB mesh to object storage, persists results to Redis + Supabase, and
streams progress so the frontend can poll `GET /scans/{id}/status`.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from celery import Celery

from app.config import get_settings
from app.ml.engine import compute_anatomical_perimeters, export_gltf, reconstruct_mesh
from app.services.storage import upload_mesh

logger = logging.getLogger(__name__)

settings = get_settings()
celery_app = Celery("tailorfit", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    task_track_started=True,
    worker_prefetch_multiplier=1,
)

STATUS_KEY = lambda scan_id: f"scan:{scan_id}:status"
RESULT_KEY = lambda scan_id: f"scan:{scan_id}:result"


def _redis():
    import redis

    return redis.Redis.from_url(settings.redis_url, decode_responses=True)


def set_scan_status(scan_id: str, status: str, progress: int = 0, error: str | None = None) -> None:
    _redis().set(
        STATUS_KEY(scan_id),
        json.dumps(
            {
                "scan_id": scan_id,
                "status": status,
                "progress": progress,
                "error": error,
            }
        ),
    )


def get_scan_status(scan_id: str) -> dict | None:
    raw = _redis().get(STATUS_KEY(scan_id))
    return json.loads(raw) if raw else None


def set_scan_result(scan_id: str, payload: dict) -> None:
    _redis().set(RESULT_KEY(scan_id), json.dumps(payload))


def get_scan_result(scan_id: str) -> dict | None:
    raw = _redis().get(RESULT_KEY(scan_id))
    return json.loads(raw) if raw else None


def _update_supabase_scan_log(scan_id: str, progress: int, status: str, extra: dict | None = None) -> None:
    """Persists scan_log progression to Supabase PostgreSQL (no-op when unconfigured)."""
    if not settings.supabase_url or not settings.supabase_service_role_key:
        logger.info("[supabase] not configured — skipping scan_log write for %s", scan_id)
        return
    from supabase import create_client

    client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    row = {
        "scan_external_id": scan_id,
        "status": status,
        "progress": progress,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if extra:
        row.update(extra)
    client.table("scan_logs").upsert(row, on_conflict="scan_external_id").execute()


@celery_app.task(name="app.tasks.scan_worker.process_body_scan_task", bind=True, max_retries=3)
def process_body_scan_task(self, scan_id: str) -> dict:
    """Heavy GPU pipeline: segment -> reconstruct -> slice -> persist."""
    scan_dir = Path(settings.upload_dir) / scan_id
    metadata_path = scan_dir / "metadata.json"
    front_path = scan_dir / "front.jpg"
    side_path = scan_dir / "side.jpg"
    back_path = scan_dir / "back.jpg"

    if not front_path.exists() or not metadata_path.exists():
        raise FileNotFoundError(f"Scan inputs missing for {scan_id}")

    metadata = json.loads(metadata_path.read_text())
    height_cm: float = float(metadata["height_cm"])

    try:
        set_scan_status(scan_id, "processing", progress=15)
        _update_supabase_scan_log(scan_id, 15, "processing")

        mesh, front_mask, side_mask = reconstruct_mesh(front_path, side_path, height_cm)
        set_scan_status(scan_id, "processing", progress=55)
        _update_supabase_scan_log(scan_id, 55, "processing")

        perimeters = compute_anatomical_perimeters(mesh, height_cm)
        set_scan_status(scan_id, "processing", progress=75)
        _update_supabase_scan_log(scan_id, 75, "processing")

        glb_bytes = mesh.export(file_type="glb")
        object_key = f"scans/{scan_id}/body.glb"
        mesh_url = upload_mesh(glb_bytes, object_key)
        set_scan_status(scan_id, "processing", progress=90)
        _update_supabase_scan_log(scan_id, 90, "processing", {"mesh_url": mesh_url})

        result = {
            "scan_id": scan_id,
            "status": "completed",
            "mesh_url": mesh_url,
            "perimeters": [{"name": name, "value_cm": value} for name, value in perimeters.items()],
            "processed_at": datetime.now(timezone.utc).isoformat(),
        }
        set_scan_result(scan_id, result)
        set_scan_status(scan_id, "completed", progress=100)
        _update_supabase_scan_log(scan_id, 100, "completed", {"mesh_url": mesh_url, "perimeters": perimeters})
        logger.info("Scan %s completed with %d perimeters", scan_id, len(perimeters))
        return result
    except Exception as exc:  # noqa: BLE001 — worker must never silently drop scans
        logger.exception("Scan %s failed", scan_id)
        set_scan_status(scan_id, "failed", progress=0, error=str(exc))
        _update_supabase_scan_log(scan_id, 0, "failed", {"error_message": str(exc)})
        raise self.retry(exc=exc, countdown=15)