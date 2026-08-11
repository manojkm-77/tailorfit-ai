"""Backend pipeline smoke test — no model weights or external services required.

Verifies the genuinely implemented components:
  - visual-hull mesh reconstruction from synthetic silhouettes
  - trimesh horizontal plane slicing + true 3D perimeter math
  - GLB export
  - face anonymization path (blur_faces)

Run: python -m tests.smoke_test   (inside the backend container)
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import numpy as np

from app.ml.engine import (
    blur_faces,
    compute_anatomical_perimeters,
    export_gltf,
    mesh_plane_perimeter,
    smoke_test_mesh,
    visual_hull_mesh,
)


def _make_silhouette(width_px: int, height_px: int) -> np.ndarray:
    mask = np.zeros((height_px, width_px), dtype=np.uint8)
    cy, cx = height_px // 2, width_px // 2
    ry, rx = int(height_px * 0.42), int(width_px * 0.16)
    y, x = np.ogrid[:height_px, :width_px]
    mask[((y - cy) / ry) ** 2 + ((x - cx) / rx) ** 2 <= 1] = 255
    return mask


def main() -> None:
    height_cm = 180.0

    # 1. Visual-hull reconstruction from synthetic front/side silhouettes
    front = _make_silhouette(480, 720)
    side = _make_silhouette(260, 720)
    hull = visual_hull_mesh(front, side, height_cm)
    actual_height = hull.bounds[1][2] - hull.bounds[0][2]
    assert abs(actual_height - height_cm) < 0.01, f"height mismatch: {actual_height}"

    # 2. Plane slicing perimeters
    waist_perimeter = mesh_plane_perimeter(hull, (0, 0, 0.58 * height_cm), (0, 0, 1))
    assert waist_perimeter > 0, "waist loop perimeter must be positive"

    # 3. Full anatomical perimeter set
    perimeters = compute_anatomical_perimeters(hull, height_cm)
    assert set(perimeters) >= {"neck", "chest", "natural_waist", "low_hip", "thigh"}
    assert all(v > 0 for v in perimeters.values()), perimeters
    print("perimeters (cm):", perimeters)

    # 4. GLB export
    out = Path("/tmp/tailorfit_smoke_body.glb")
    export_gltf(hull, out)
    assert out.stat().st_size > 0
    print("glb bytes:", out.stat().st_size)

    # 5. Face anonymization on a synthetic image (no faces expected — should not crash)
    img = np.zeros((200, 200, 3), dtype=np.uint8)
    blurred = blur_faces(img)
    assert blurred.shape == img.shape

    print("SMOKE TEST PASSED")


if __name__ == "__main__":
    main()