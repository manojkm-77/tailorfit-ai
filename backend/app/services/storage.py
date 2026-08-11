"""Object-storage helper for GLTF/GLB mesh assets (AWS S3 / Cloudflare R2)."""
from __future__ import annotations

import io
from pathlib import Path

import boto3
from botocore.client import Config

from app.config import get_settings


def upload_mesh(mesh_bytes: bytes, object_key: str, content_type: str = "model/gltf-binary") -> str:
    """Uploads mesh bytes and returns the public URL (or object key if no public base URL)."""
    settings = get_settings()
    client = boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url or None,
        aws_access_key_id=settings.s3_access_key_id or None,
        aws_secret_access_key=settings.s3_secret_access_key or None,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )
    client.upload_fileobj(
        io.BytesIO(mesh_bytes),
        settings.s3_bucket,
        object_key,
        ExtraArgs={"ContentType": content_type},
    )
    if settings.s3_public_base_url:
        return f"{settings.s3_public_base_url.rstrip('/')}/{object_key}"
    return f"s3://{settings.s3_bucket}/{object_key}"


def write_local(path: Path, mesh_bytes: bytes) -> Path:
    """Local mirror used when object storage is not configured (dev mode)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(mesh_bytes)
    return path