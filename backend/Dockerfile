# TailorFit AI — Backend ML worker image
# Python 3.11 + CUDA 12 for PyTorch GPU inference, OpenCV, Trimesh, Open3D, YOLOv8-seg, SMPL-X

FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# System dependencies for OpenCV / Open3D / Trimesh native libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/backend

# Install CUDA-enabled PyTorch first (CUDA 12.x wheel index)
RUN pip install --upgrade pip \
    && pip install --index-url https://download.pytorch.org/whl/cu121 \
        torch==2.5.1 torchvision==0.20.1

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app
COPY migrations ./migrations

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]