import { BodyMeasurementItem } from '@/types/measurement';

/**
 * Garment Ease Allowance Engine (Phase 3, P3_T2).
 *
 * Converts raw body measurements into pattern-cut dimensions by adding a fit-profile
 * ease allowance per garment type:
 *   Slim    → +2cm..+4cm
 *   Regular → +6cm..+8cm
 *   Relaxed → +10cm and up
 */

export type FitProfile = 'slim' | 'regular' | 'relaxed';
export type GarmentType = 'Suit' | 'Shirt' | 'Trousers' | 'Dress';

export type EaseRegion = 'chest' | 'waist' | 'hip' | 'shoulder' | 'arm' | 'inseam';

const FIT_PROFILE_EASE_CM: Record<FitProfile, Record<EaseRegion, readonly [number, number]>> = {
  slim: {
    chest: [2.0, 4.0],
    waist: [2.0, 3.0],
    hip: [2.0, 4.0],
    shoulder: [0.5, 1.0],
    arm: [1.0, 2.0],
    inseam: [0.0, 0.0],
  },
  regular: {
    chest: [6.0, 8.0],
    waist: [5.0, 7.0],
    hip: [6.0, 8.0],
    shoulder: [1.0, 2.0],
    arm: [2.0, 3.0],
    inseam: [0.0, 1.0],
  },
  relaxed: {
    chest: [10.0, 12.0],
    waist: [10.0, 12.0],
    hip: [10.0, 14.0],
    shoulder: [2.0, 3.0],
    arm: [3.0, 4.0],
    inseam: [0.0, 2.0],
  },
};

const GARMENT_REGION_WEIGHTS: Record<GarmentType, Record<EaseRegion, number>> = {
  Suit: { chest: 1.0, waist: 1.0, hip: 1.0, shoulder: 1.0, arm: 1.0, inseam: 0.5 },
  Shirt: { chest: 1.0, waist: 0.9, hip: 0.8, shoulder: 1.0, arm: 1.0, inseam: 0.0 },
  Trousers: { chest: 0.0, waist: 1.0, hip: 1.0, shoulder: 0.0, arm: 0.0, inseam: 1.0 },
  Dress: { chest: 1.0, waist: 0.8, hip: 1.2, shoulder: 0.8, arm: 0.8, inseam: 0.0 },
};

const MEASUREMENT_TO_REGION: Record<string, EaseRegion> = {
  chest: 'chest',
  bust: 'chest',
  waist: 'waist',
  hip: 'hip',
  shoulder: 'shoulder',
  arm_length: 'arm',
  bicep: 'arm',
  inseam: 'inseam',
  outseam: 'inseam',
};

/** Midpoint of the fit-profile ease range for a region, weighted by garment type. */
export function easeForRegion(garmentType: GarmentType, fitProfile: FitProfile, region: EaseRegion): number {
  const [minEase, maxEase] = FIT_PROFILE_EASE_CM[fitProfile][region];
  const weight = GARMENT_REGION_WEIGHTS[garmentType][region];
  return Math.round(((minEase + maxEase) / 2) * weight * 10) / 10;
}

/** Returns pattern-cut dimensions (body + ease) for each supplied body measurement (cm). */
export function adjustMeasurements(
  bodyMeasurementsCm: Record<string, number>,
  garmentType: GarmentType,
  fitProfile: FitProfile
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [name, bodyCm] of Object.entries(bodyMeasurementsCm)) {
    const region = MEASUREMENT_TO_REGION[name];
    const ease = region ? easeForRegion(garmentType, fitProfile, region) : 0;
    result[name] = Math.round((bodyCm + ease) * 10) / 10;
  }
  return result;
}

/** Convenience: applies ease to the app's BodyMeasurementItem[] grid, producing a cut sheet. */
export function applyEaseToBodyMeasurements(
  items: BodyMeasurementItem[],
  garmentType: GarmentType,
  fitProfile: FitProfile
): BodyMeasurementItem[] {
  const patternCut = adjustMeasurements(
    Object.fromEntries(items.map((item) => [item.id, item.valueCm])),
    garmentType,
    fitProfile
  );
  return items.map((item) => {
    const cutCm = patternCut[item.id] ?? item.valueCm;
    return {
      ...item,
      valueCm: cutCm,
      valueInches: Math.round((cutCm / 2.54) * 10) / 10,
      tailorNotes: `${item.tailorNotes} (Pattern cut · ${fitProfile} fit · ${garmentType})`,
    };
  });
}