"""Unit tests for the backend Garment Ease Allowance Engine (P3_T2)."""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.ease import adjust_measurements, ease_for_region


def test_slim_suit_midpoint():
    # Slim Suit chest ease = midpoint(2,4) * 1.0 = 3.0
    assert ease_for_region("suit", "slim", "chest") == 3.0


def test_relaxed_dress_hip():
    # Relaxed Dress hip ease = midpoint(10,14) * 1.2 = 14.4
    assert ease_for_region("dress", "relaxed", "hip") == 14.4


def test_trousers_ignore_chest():
    assert ease_for_region("trousers", "regular", "chest") == 0.0


def test_adjust_measurements_smoke():
    body = {"chest": 100.0, "waist": 84.0, "hip": 98.0, "inseam": 80.0}
    pattern = adjust_measurements(body, "suit", "regular")
    assert pattern["chest"] == 107.0  # 100 + 7.0
    assert pattern["waist"] == 90.0   # 84 + 6.0
    assert pattern["hip"] == 105.0    # 98 + 7.0
    assert pattern["inseam"] == 80.5  # 80 + 0.5