"""Garment Ease Allowance Engine (backend mirror of src/lib/easeEngine.ts).

Converts raw body measurements into pattern-cut dimensions by adding a fit-profile
ease allowance per garment type.
"""
from __future__ import annotations

from typing import Literal

FitProfile = Literal["slim", "regular", "relaxed"]
GarmentType = Literal["suit", "shirt", "trousers", "dress"]

# Base ease offsets (cm) applied to key body regions for each fit profile.
# Ranges from the product spec: Slim +2..+4, Regular +6..+8, Relaxed +10+
FIT_PROFILE_EASE_CM: dict[FitProfile, dict[str, tuple[float, float]]] = {
    "slim": {
        "chest": (2.0, 4.0),
        "waist": (2.0, 3.0),
        "hip": (2.0, 4.0),
        "shoulder": (0.5, 1.0),
        "arm": (1.0, 2.0),
        "inseam": (0.0, 0.0),
    },
    "regular": {
        "chest": (6.0, 8.0),
        "waist": (5.0, 7.0),
        "hip": (6.0, 8.0),
        "shoulder": (1.0, 2.0),
        "arm": (2.0, 3.0),
        "inseam": (0.0, 1.0),
    },
    "relaxed": {
        "chest": (10.0, 12.0),
        "waist": (10.0, 12.0),
        "hip": (10.0, 14.0),
        "shoulder": (2.0, 3.0),
        "arm": (3.0, 4.0),
        "inseam": (0.0, 2.0),
    },
}

# Garment types adjust which regions the ease is applied to and by how much.
GARMENT_REGION_WEIGHTS: dict[GarmentType, dict[str, float]] = {
    "suit": {"chest": 1.0, "waist": 1.0, "hip": 1.0, "shoulder": 1.0, "arm": 1.0, "inseam": 0.5},
    "shirt": {"chest": 1.0, "waist": 0.9, "hip": 0.8, "shoulder": 1.0, "arm": 1.0, "inseam": 0.0},
    "trousers": {"chest": 0.0, "waist": 1.0, "hip": 1.0, "shoulder": 0.0, "arm": 0.0, "inseam": 1.0},
    "dress": {"chest": 1.0, "waist": 0.8, "hip": 1.2, "shoulder": 0.8, "arm": 0.8, "inseam": 0.0},
}


def ease_for_region(
    garment_type: GarmentType, fit_profile: FitProfile, region: str
) -> float:
    """Midpoint of the fit-profile ease range, weighted by garment type."""
    low, high = FIT_PROFILE_EASE_CM[fit_profile].get(region, (0.0, 0.0))
    weight = GARMENT_REGION_WEIGHTS[garment_type].get(region, 0.0)
    return round(((low + high) / 2.0) * weight, 1)


def adjust_measurements(
    body_measurements_cm: dict[str, float],
    garment_type: GarmentType,
    fit_profile: FitProfile,
) -> dict[str, float]:
    """Returns pattern-cut dimensions (body + ease) for each supplied measurement."""
    region_by_measurement = {
        "chest": "chest",
        "bust": "chest",
        "waist": "waist",
        "hip": "hip",
        "shoulder": "shoulder",
        "arm_length": "arm",
        "bicep": "arm",
        "inseam": "inseam",
        "outseam": "inseam",
    }
    result: dict[str, float] = {}
    for name, body_cm in body_measurements_cm.items():
        region = region_by_measurement.get(name)
        ease = ease_for_region(garment_type, fit_profile, region) if region else 0.0
        result[name] = round(body_cm + ease, 1)
    return result