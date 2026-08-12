# TailorFit AI — Microservices API Specification & Architecture

## System Overview

TailorFit AI consists of a Next.js 14 Web Assembly frontend integrated with a GPU-accelerated Python FastAPI backend for 3D body reconstruction and multi-view photogrammetry perimeter extraction.

---

## Backend Microservice Endpoints

### 1. `POST /api/v1/scans/upload`
Enqueues a new body scan job for asynchronous processing on the GPU Celery worker.

- **Request**: `multipart/form-data`
  - `front`: Image File (Required, JPG/PNG/WebP)
  - `side`: Image File (Required for 3D depth)
  - `back`: Image File (Optional)
  - `height_cm`: Float ($30 \le h \le 272$)
  - `weight_kg`: Float (Optional)
  - `gender`: `"male" | "female" | "unisex"`
  - `unit`: `"cm" | "inches"`
- **Response**: `202 Accepted`
  ```json
  {
    "scan_id": "8f902a1b94e3415c829e",
    "status": "queued",
    "progress": 0
  }
  ```

---

### 2. `GET /api/v1/scans/{scan_id}/status`
Polls processing lifecycle progression and quality gate inspection state.

- **Response**: `200 OK`
  ```json
  {
    "scan_id": "8f902a1b94e3415c829e",
    "status": "processing",
    "progress": 75,
    "error": null
  }
  ```

---

### 3. `GET /api/v1/scans/{scan_id}/results`
Returns exported 3D body GLTF model URL and calculated perimeters.

- **Response**: `200 OK`
  ```json
  {
    "scan_id": "8f902a1b94e3415c829e",
    "status": "completed",
    "mesh_url": "https://storage.tailorfit.ai/scans/8f902a1b94e3415c829e/body.glb",
    "perimeters": [
      { "name": "chest", "value_cm": 104.2 },
      { "name": "natural_waist", "value_cm": 84.5 },
      { "name": "low_hip", "value_cm": 98.2 }
    ]
  }
  ```

---

### 4. `POST /api/v1/garments/ease-adjust`
Computes pattern-cut garment dimensions with ease allowances.

- **Request Payload**:
  ```json
  {
    "body_measurements_cm": { "chest": 104.2, "waist": 84.5 },
    "garment_type": "suit",
    "fit_profile": "regular"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "garment_type": "suit",
    "fit_profile": "regular",
    "pattern_cut_cm": { "chest": 111.2, "waist": 90.5 }
  }
  ```
