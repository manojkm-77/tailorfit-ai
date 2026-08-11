"""TailorFit AI — FastAPI OpenAPI gateways (P2_T2).

Endpoints:
  POST /api/v1/scans/upload        — multi-view upload, enqueues Celery scan job
  GET  /api/v1/scans/{scan_id}/status
  GET  /api/v1/scans/{scan_id}/results
  POST /api/v1/garments/ease-adjust
"""
from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from app.config import get_settings
from app.services.ease import FitProfile, GarmentType, adjust_measurements
from app.tasks.scan_worker import (
    get_scan_result,
    get_scan_status,
    process_body_scan_task,
    set_scan_status,
)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0-production",
    description="AI Human Body Measurement Platform — backend microservice.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


class ScanUploadResponse(BaseModel):
    scan_id: str
    status: str = "queued"
    progress: int = 0


class ScanStatusResponse(BaseModel):
    scan_id: str
    status: str
    progress: int = 0
    error: str | None = None


class PerimeterItem(BaseModel):
    name: str
    value_cm: float


class ScanResultsResponse(BaseModel):
    scan_id: str
    status: str = "completed"
    mesh_url: str
    perimeters: list[PerimeterItem]


class EaseAdjustRequest(BaseModel):
    body_measurements_cm: dict[str, float] = Field(..., description="Raw body measurements in cm")
    garment_type: GarmentType
    fit_profile: FitProfile

    @field_validator("garment_type")
    @classmethod
    def _normalize_garment(cls, value: str) -> GarmentType:
        return value.lower()  # type: ignore[return-value]


class EaseAdjustResponse(BaseModel):
    garment_type: GarmentType
    fit_profile: FitProfile
    body_measurements_cm: dict[str, float]
    pattern_cut_cm: dict[str, float]


@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok", "service": settings.app_name}


@app.post("/api/v1/scans/upload", response_model=ScanUploadResponse, status_code=202)
async def upload_scan(
    front: UploadFile = File(..., description="Front view photo"),
    side: UploadFile | None = File(None, description="Side view photo (depth fusion)"),
    back: UploadFile | None = File(None, description="Back view photo (optional)"),
    height_cm: float = Form(..., ge=30, le=272),
    weight_kg: float | None = Form(None, ge=10, le=400),
    gender: Literal["male", "female", "unisex"] = Form("unisex"),
    unit: Literal["cm", "inches"] = Form("cm"),
) -> ScanUploadResponse:
    scan_id = uuid.uuid4().hex
    scan_dir = Path(settings.upload_dir) / scan_id
    scan_dir.mkdir(parents=True, exist_ok=True)

    for view, upload in (("front", front), ("side", side), ("back", back)):
        if upload is None:
            continue
        data = await upload.read()
        if not data:
            raise HTTPException(status_code=400, detail=f"Empty {view} image payload.")
        suffix = Path(upload.filename or "").suffix.lower()
        if suffix not in UPLOAD_EXTENSIONS:
            suffix = ".jpg"
        (scan_dir / f"{view}{suffix}").write_bytes(data)

    metadata = {
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "gender": gender,
        "unit": unit,
        "scanned_views": ["front"] + ([ "side"] if side else []) + (["back"] if back else []),
    }
    (scan_dir / "metadata.json").write_text(json.dumps(metadata))

    set_scan_status(scan_id, "queued", progress=0)
    process_body_scan_task.delay(scan_id)
    return ScanUploadResponse(scan_id=scan_id)


@app.get("/api/v1/scans/{scan_id}/status", response_model=ScanStatusResponse)
def scan_status(scan_id: str) -> ScanStatusResponse:
    status = get_scan_status(scan_id)
    if status is None:
        raise HTTPException(status_code=404, detail=f"Unknown scan: {scan_id}")
    return ScanStatusResponse(**status)


@app.get("/api/v1/scans/{scan_id}/results", response_model=ScanResultsResponse)
def scan_results(scan_id: str) -> ScanResultsResponse:
    status = get_scan_status(scan_id)
    if status is None:
        raise HTTPException(status_code=404, detail=f"Unknown scan: {scan_id}")
    if status["status"] != "completed":
        raise HTTPException(status_code=409, detail=f"Scan not ready (status={status['status']}).")
    result = get_scan_result(scan_id)
    if result is None:
        raise HTTPException(status_code=500, detail="Scan completed but no result payload was found.")
    return ScanResultsResponse(
        scan_id=scan_id,
        mesh_url=result["mesh_url"],
        perimeters=[PerimeterItem(**item) for item in result["perimeters"]],
    )


@app.post("/api/v1/garments/ease-adjust", response_model=EaseAdjustResponse)
def ease_adjust(request: EaseAdjustRequest) -> EaseAdjustResponse:
    pattern_cut = adjust_measurements(request.body_measurements_cm, request.garment_type, request.fit_profile)
    return EaseAdjustResponse(
        garment_type=request.garment_type,
        fit_profile=request.fit_profile,
        body_measurements_cm=request.body_measurements_cm,
        pattern_cut_cm=pattern_cut,
    )