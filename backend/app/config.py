"""TailorFit AI backend configuration (12-factor, env-driven)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    app_name: str = "TailorFit AI Backend"
    api_version: str = "v1"
    cors_origins: str = "http://localhost:3000"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # Object storage (AWS S3 / Cloudflare R2)
    s3_endpoint_url: str = ""
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_bucket: str = "tailorfit-scans"
    s3_public_base_url: str = ""

    # ML artifacts
    smplx_model_path: str = ""
    hmr2_checkpoint_path: str = ""
    yolo_seg_weights: str = "yolov8n-seg.pt"

    # Local storage for queued uploads
    upload_dir: str = "./storage/uploads"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()