# TailorFit AI — Backend (Phase 2 & 3)

FastAPI microservice + Celery GPU worker + PyTorch/Trimesh measurement engine + Supabase schema.

## Quick start

```bash
cp .env.example .env   # fill Supabase / R2 secrets
docker compose up --build
```

Services:
- `backend` — API at `http://localhost:8000` (OpenAPI at `/docs`)
- `celery-worker` — consumes `process_body_scan_task` from Redis
- `redis` — broker + scan status/result cache

## API

| Method | Path                                | Purpose                                  |
|--------|-------------------------------------|------------------------------------------|
| POST   | `/api/v1/scans/upload`              | Front/Side/Back upload + metadata, enqueue scan |
| GET    | `/api/v1/scans/{scan_id}/status`    | Poll processing progress                  |
| GET    | `/api/v1/scans/{scan_id}/results`   | GLB mesh URL + 18+ anatomical perimeters  |
| POST   | `/api/v1/garments/ease-adjust`      | Fit-profile → pattern-cut dimensions      |
| GET    | `/healthz`                          | Liveness                                 |

## Verification

```bash
# Unit tests (ease engine, pure Python)
python -m pytest tests/

# Pipeline smoke test (needs numpy + trimesh + opencv only; no weights)
python -m tests.smoke_test

# Full GPU path (requires SMPL-X checkpoint in SMPLX_MODEL_PATH)
docker compose up --build celery-worker
```

## Notes

- Without `SMPLX_MODEL_PATH` / `HMR2_CHECKPOINT_PATH`, scans use the deterministic
  visual-hull reconstruction (real silhouette lofting, no synthetic measurement data).
- YOLOv8-seg weights are downloaded on first run (`yolov8n-seg.pt`).
- PyTorch is installed from the CUDA 12 wheel index (see `Dockerfile`).
- Supabase writes are skipped when `SUPABASE_URL` is empty (local dev mode).