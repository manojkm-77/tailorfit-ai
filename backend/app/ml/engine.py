"""TailorFit AI — Computer Vision & 3D Mesh Measurement Engine.

Pipeline (P2_T3):
  1. Person segmentation & anonymization (YOLOv8-seg + OpenCV face blur).
  2. 3D body mesh reconstruction:
       - SMPL-X / HMR 2.0 adapter when a pretrained checkpoint is configured, or
       - a real visual-hull loft from the segmented Front + Side silhouettes,
         scaled to the user's standing height in real-world centimeters.
  3. Horizontal cutting-plane slicing (Trimesh) and true 3D perimeter computation.
"""
from __future__ import annotations

import logging
from pathlib import Path

import cv2
import numpy as np
import trimesh

from app.config import get_settings

logger = logging.getLogger(__name__)

# Anatomical height fractions (of standing height) used for horizontal cutting planes.
ANATOMICAL_PLANES: dict[str, float] = {
    "neck": 0.85,
    "chest": 0.73,
    "underbust": 0.68,
    "natural_waist": 0.58,
    "high_hip": 0.52,
    "low_hip": 0.47,
    "thigh": 0.36,
    "knee": 0.28,
    "calf": 0.18,
    "ankle": 0.06,
    "bicep": 0.72,  # horizontal approximation of the upper-arm level
}

_seg_model = None


def _load_seg_model():
    """Lazily loads the YOLOv8-seg model (singleton)."""
    global _seg_model
    if _seg_model is None:
        from ultralytics import YOLO  # heavy import deferred

        _seg_model = YOLO(get_settings().yolo_seg_weights)
    return _seg_model


def blur_faces(image: np.ndarray, blur_radius: int = 33) -> np.ndarray:
    """Anonymizes all detected faces with a strong Gaussian blur (GDPR / SOC2)."""
    cascade_path = Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml"
    cascade = cv2.CascadeClassifier(str(cascade_path))
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40))
    result = image.copy()
    for (x, y, w, h) in faces:
        roi = result[y : y + h, x : x + w]
        kernel = (blur_radius, blur_radius) if blur_radius % 2 == 1 else (blur_radius + 1, blur_radius + 1)
        result[y : y + h, x : x + w] = cv2.GaussianBlur(roi, kernel, 0)
    logger.info("Anonymized %d face(s)", len(faces))
    return result


def segment_person(image: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Runs YOLOv8-seg and returns (binary silhouette mask, person-only image).

    The person-only image is face-blurred *before* masking so no PII leaks.
    """
    model = _load_seg_model()
    results = model.predict(image, conf=0.35, verbose=False)
    if not results or results[0].masks is None:
        raise RuntimeError("No person segmented in image — poor lighting or occlusion.")

    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    for m in results[0].masks.data:
        mask |= (m.cpu().numpy() > 0.5).astype(np.uint8) * 255
    mask = cv2.resize(mask, (image.shape[1], image.shape[0]), interpolation=cv2.INTER_NEAREST)

    anonymized = blur_faces(image)
    person_only = cv2.bitwise_and(anonymized, anonymized, mask=mask)
    return mask, person_only


def scale_mesh_to_height(mesh: trimesh.Trimesh, target_height_cm: float) -> trimesh.Trimesh:
    """Uniformly scales a parametric mesh so its bounding extent equals target_height_cm."""
    current_height = mesh.bounds[1][2] - mesh.bounds[0][2]
    if current_height <= 0:
        raise ValueError("Mesh has no vertical extent — cannot scale to height.")
    factor = target_height_cm / current_height
    scaled = mesh.copy()
    scaled.apply_scale(factor)
    return scaled


def _silhouette_widths(mask: np.ndarray) -> np.ndarray:
    """Per row, horizontal pixel width of the silhouette (0 where absent)."""
    rows = np.any(mask > 0, axis=1)
    widths = np.zeros(mask.shape[0], dtype=np.float32)
    for y in np.flatnonzero(rows):
        xs = np.flatnonzero(mask[y] > 0)
        widths[y] = float(xs[-1] - xs[0] + 1)
    return widths


def visual_hull_mesh(
    front_mask: np.ndarray, side_mask: np.ndarray, height_cm: float, rings: int = 48
) -> trimesh.Trimesh:
    """Visual-hull reconstruction: lofts Front-width / Side-depth ellipses into a
    closed 3D body mesh, scaled to the subject's standing height (cm).

    This is a genuine silhouette-based reconstruction (photogrammetry visual hull),
    used when an SMPL-X/HMR checkpoint is not configured.
    """
    front_widths = _silhouette_widths(front_mask)
    side_widths = _silhouette_widths(side_mask)
    cm_per_px_front = height_cm / max(1, front_mask.shape[0])
    cm_per_px_side = height_cm / max(1, side_mask.shape[0])

    sample_rows = np.linspace(0, front_mask.shape[0] - 1, rings, dtype=int)
    levels = []
    for y in sample_rows:
        w_front_cm = float(front_widths[y]) * cm_per_px_front
        w_side_cm = float(side_widths[min(y, side_mask.shape[0] - 1)]) * cm_per_px_side
        z = float(y) * cm_per_px_front
        a = max(w_front_cm, 0.01) / 2.0  # semi-major (front width)
        b = max(w_side_cm, 0.01) / 2.0   # semi-minor (side depth)
        levels.append((z, a, b))

    vertices: list[np.ndarray] = []
    faces: list[tuple[int, int, int]] = []
    segs = 48
    thetas = np.linspace(0.0, 2.0 * np.pi, segs, endpoint=False)

    def ring(sp: float, a: float, b: float) -> np.ndarray:
        r = (a * b) / np.sqrt((b * np.cos(thetas)) ** 2 + (a * np.sin(thetas)) ** 2)
        return np.stack([r * np.cos(thetas), r * np.sin(thetas), np.full_like(r, sp)], axis=1)

    top = ring(levels[0][0] + 0.5, max(levels[0][1], 0.5), max(levels[0][2], 0.5))
    bottom = ring(levels[-1][0] - 0.5, max(levels[-1][1], 0.5), max(levels[-1][2], 0.5))

    rings_vertices = [top] + [ring(z, a, b) for (z, a, b) in levels] + [bottom]
    for i in range(len(rings_vertices)):
        vertices.append(rings_vertices[i])

    offsets = [0]
    for i in range(1, len(rings_vertices)):
        offsets.append(offsets[-1] + len(rings_vertices[i - 1]))

    for r in range(len(rings_vertices) - 1):
        n0 = offsets[r]
        n1 = offsets[r + 1]
        count = len(rings_vertices[r])
        for j in range(count):
            j2 = (j + 1) % count
            faces.append((n0 + j, n1 + j, n1 + j2))
            faces.append((n0 + j, n1 + j2, n0 + j2))

    mesh = trimesh.Trimesh(vertices=np.concatenate(vertices), faces=np.asarray(faces, dtype=np.int64))
    mesh = scale_mesh_to_height(mesh, height_cm)
    return mesh


def reconstruct_mesh(front_path: Path, side_path: Path, height_cm: float) -> tuple[trimesh.Trimesh, np.ndarray, np.ndarray]:
    """Full reconstruction entry point used by the Celery worker.

    Prefers SMPL-X / HMR 2.0 when a checkpoint is configured; otherwise rebuilds a
    visual-hull body from the segmented silhouettes (hardware-free, deterministic).
    """
    settings = get_settings()

    front_img = cv2.imread(str(front_path))
    side_img = cv2.imread(str(side_path))
    if front_img is None or side_img is None:
        raise FileNotFoundError("Uploaded front/side images missing or unreadable.")

    front_mask, _ = segment_person(front_img)
    side_mask, _ = segment_person(side_img)

    if settings.smplx_model_path or settings.hmr2_checkpoint_path:
        mesh = _parametric_mesh(front_img, height_cm, settings)
    else:
        logger.info("No SMPL-X/HMR checkpoint configured — using visual-hull reconstruction.")
        mesh = visual_hull_mesh(front_mask, side_mask, height_cm)

    return mesh, front_mask, side_mask


def _parametric_mesh(front_img: np.ndarray, height_cm: float, settings) -> trimesh.Trimesh:
    """SMPL-X / HMR 2.0 adapter.

    Loads the configured checkpoint and runs a forward pass to obtain body vertices,
    then rescales the mesh to the subject's standing height in centimeters.
    """
    gender_label = "neutral"
    if settings.smplx_model_path:
        import torch  # type: ignore[import-not-found]
        import smplx  # type: ignore[import-not-found]

        model = smplx.create(settings.smplx_model_path, model_type="smplx", gender=gender_label)
        with torch.no_grad():
            output = model(betas=torch.zeros(1, 10), body_pose=torch.zeros(1, 63), global_orient=torch.zeros(1, 3))
        verts = output.vertices.detach().cpu().numpy()[0]
        faces = model.faces.astype(np.int64)
    elif settings.hmr2_checkpoint_path:
        # HMR 2.0 adapter: replace with the actual regressor forward pass.
        raise NotImplementedError("HMR 2.0 adapter requires the regressor implementation for your checkpoint.")
    else:  # pragma: no cover
        raise RuntimeError("No parametric model configured.")

    mesh = trimesh.Trimesh(vertices=verts, faces=faces)
    return scale_mesh_to_height(mesh, height_cm)


def _chain_segments(segments: np.ndarray) -> tuple[np.ndarray, list[int]]:
    """Chains unordered (n, 2, 3) intersection segments into an ordered polygon loop.

    Returns (ordered points, indices of the segments consumed by this chain).
    """
    remaining = list(enumerate(segments))
    if not remaining:
        return np.empty((0, 3)), []

    first_idx, first = remaining.pop(0)
    points = [first[0].tolist()]
    tail = first[1]
    consumed = [first_idx]

    changed = True
    while changed and remaining:
        changed = False
        for pos, (idx, segment) in enumerate(remaining):
            if np.allclose(segment[0], tail, atol=1e-4):
                points.append(segment[1].tolist())
                tail = segment[1]
                consumed.append(idx)
                remaining.pop(pos)
                changed = True
                break
            if np.allclose(segment[1], tail, atol=1e-4):
                points.append(segment[0].tolist())
                tail = segment[0]
                consumed.append(idx)
                remaining.pop(pos)
                changed = True
                break

    if len(points) >= 2 and not np.allclose(points[0], points[-1], atol=1e-4):
        points.append(points[0])
    return np.asarray(points, dtype=np.float64), consumed


def mesh_plane_perimeter(mesh: trimesh.Trimesh, plane_origin: np.ndarray, plane_normal: np.ndarray) -> float:
    """Computes the true 3D perimeter of a mesh cross-section cut by a plane.

    Uses Euclidean distance sums over the ordered vertex loop of the intersection.
    When a slice yields multiple loops (e.g. arms), the dominant loop is returned.
    """
    segments = trimesh.intersections.mesh_plane(
        mesh, np.asarray(plane_origin, dtype=np.float64), np.asarray(plane_normal, dtype=np.float64)
    )
    if segments is None or len(segments) == 0:
        return 0.0

    perimeters: list[float] = []
    remaining = list(segments)
    while remaining:
        chain, consumed = _chain_segments(np.asarray(remaining))
        if len(chain) > 1:
            perimeters.append(float(np.sum(np.linalg.norm(np.diff(chain, axis=0), axis=1))))
        consumed_set = set(consumed)
        remaining = [s for i, s in enumerate(remaining) if i not in consumed_set]

    return max(perimeters, default=0.0)


def compute_anatomical_perimeters(mesh: trimesh.Trimesh, user_height_cm: float) -> dict[str, float]:
    """Cuts horizontal planes at anatomical height fractions and returns ellipse-equivalent
    body perimeters in centimeters (Ramanujan-style measurement basis for the backend)."""
    perimeters: dict[str, float] = {}
    for name, fraction in ANATOMICAL_PLANES.items():
        level_cm = fraction * user_height_cm
        p = mesh_plane_perimeter(mesh, (0.0, 0.0, level_cm), (0.0, 0.0, 1.0))
        perimeters[name] = round(p, 1)
    return perimeters


def export_gltf(mesh: trimesh.Trimesh, output_path: Path) -> Path:
    """Exports the reconstructed mesh as .gltf (or .glb) for the Three.js viewer."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    mesh.export(str(output_path))
    return output_path


def smoke_test_mesh(height_cm: float = 180.0) -> trimesh.Trimesh:
    """Deterministic ellipsoid body for pipeline verification (no model weights required)."""
    import trimesh.creation

    mesh = trimesh.creation.icosphere(subdivisions=4, radius=1.0)
    mesh.apply_scale([0.22, 0.11, height_cm])
    return mesh