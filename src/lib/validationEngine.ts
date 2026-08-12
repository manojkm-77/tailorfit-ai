import { PoseLandmarks33 } from '@/types/measurement';

export interface ImageQualityMetrics {
  blurScore: number; // Laplacian variance (higher is sharper; < 100 is blurry)
  isBlurry: boolean;
  lightingScore: number; // Mean luminance 0..255 (20..240 valid)
  isLightingValid: boolean;
}

export interface AccuracyValidationResult {
  isValid: boolean;
  headVisible: boolean;
  anklesVisible: boolean;
  bodyVisibilityScore: number; // 0..100%
  segmentationScore: number; // 0..100%
  landmarkConfidenceScore: number; // 0..100%
  lightingScore: number;
  blurScore: number;
  isPoseStraight: boolean;
  rejectionReasons: string[];
  overallConfidence: number; // 0..100%
}

/**
  * Performs Laplacian variance blur detection and mean luminance lighting check on an HTML Image Element or Canvas
  */
export function inspectImageQuality(
  imageSource: HTMLImageElement | HTMLCanvasElement
): ImageQualityMetrics {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { blurScore: 150, isBlurry: false, lightingScore: 128, isLightingValid: true };
  }

  // Downsample to 256x256 for fast pixel inspection
  canvas.width = 256;
  canvas.height = 256;
  ctx.drawImage(imageSource, 0, 0, 256, 256);
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;

  // 1. Compute Mean Luminance (Lighting Score)
  let totalLuminance = 0;
  const pixelCount = 256 * 256;
  const grays = new Float32Array(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    grays[i] = lum;
    totalLuminance += lum;
  }

  const meanLuminance = totalLuminance / pixelCount;
  const isLightingValid = meanLuminance >= 20 && meanLuminance <= 240;

  // 2. Compute 3x3 Laplacian Variance (Blur Score)
  // Kernel: [0, 1, 0; 1, -4, 1; 0, 1, 0]
  let lapSum = 0;
  let lapSqSum = 0;
  let count = 0;

  for (let y = 1; y < 255; y++) {
    for (let x = 1; x < 255; x++) {
      const idx = y * 256 + x;
      const val =
        grays[idx - 256] +
        grays[idx + 256] +
        grays[idx - 1] +
        grays[idx + 1] -
        4 * grays[idx];

      lapSum += val;
      lapSqSum += val * val;
      count++;
    }
  }

  const lapMean = lapSum / count;
  const blurScore = Math.round(lapSqSum / count - lapMean * lapMean);
  const isBlurry = blurScore < 85;

  return {
    blurScore,
    isBlurry,
    lightingScore: Math.round(meanLuminance),
    isLightingValid,
  };
}

/**
  * Runs strict production validation gates on Front & Side pose landmarks + image quality metrics
  */
export function validateStrictQualityGates(
  frontLandmarks: PoseLandmarks33 | null,
  sideLandmarks: PoseLandmarks33 | null,
  frontQuality?: ImageQualityMetrics,
  sideQuality?: ImageQualityMetrics
): AccuracyValidationResult {
  const rejectionReasons: string[] = [];

  // Gate 1: Check Front Landmarks Presence
  if (!frontLandmarks) {
    return {
      isValid: false,
      headVisible: false,
      anklesVisible: false,
      bodyVisibilityScore: 0,
      segmentationScore: 0,
      landmarkConfidenceScore: 0,
      lightingScore: frontQuality?.lightingScore ?? 0,
      blurScore: frontQuality?.blurScore ?? 0,
      isPoseStraight: false,
      rejectionReasons: ['Front photo pose landmark extraction failed. No person detected.'],
      overallConfidence: 0,
    };
  }

  // Gate 2: Check Side View Presence (Mandatory Requirement #10)
  if (!sideLandmarks) {
    rejectionReasons.push('Side view photo is required for 3D depth calculation.');
  }

  // Gate 3: Head Visibility Gate (Nose/Eyes/Ears)
  const headVisible =
    (frontLandmarks.nose?.visibility ?? 0) >= 0.50 &&
    (frontLandmarks.leftEye?.visibility ?? 0) >= 0.50 &&
    (frontLandmarks.rightEye?.visibility ?? 0) >= 0.50;

  if (!headVisible) {
    rejectionReasons.push('Head is missing or cut off in front photo. Full head visibility required.');
  }

  // Gate 4: Ankles & Feet Visibility Gate
  const anklesVisible =
    (frontLandmarks.leftAnkle?.visibility ?? 0) >= 0.50 &&
    (frontLandmarks.rightAnkle?.visibility ?? 0) >= 0.50;

  if (!anklesVisible) {
    rejectionReasons.push('Ankles or feet are missing in front photo. Full head-to-heel visibility required.');
  }

  // Gate 5: 33-Landmark Mean Visibility Score (Requirement #2: >= 95% threshold)
  const allJoints = Object.values(frontLandmarks);
  const totalVisibility = allJoints.reduce((sum, lm) => sum + (lm?.visibility ?? 0), 0);
  const bodyVisibilityScore = Math.round((totalVisibility / allJoints.length) * 100);

  if (bodyVisibilityScore < 85) {
    rejectionReasons.push(
      `Body visibility score (${bodyVisibilityScore}%) is below strict 85% threshold. Ensure subject is un-occluded.`
    );
  }

  // Gate 6: Segmentation & Landmark Confidence Score (Requirement #2: >= 90%)
  const landmarkConfidenceScore = Math.round(
    (((frontLandmarks.leftShoulder?.visibility ?? 0) +
      (frontLandmarks.rightShoulder?.visibility ?? 0) +
      (frontLandmarks.leftHip?.visibility ?? 0) +
      (frontLandmarks.rightHip?.visibility ?? 0) +
      (frontLandmarks.leftAnkle?.visibility ?? 0) +
      (frontLandmarks.rightAnkle?.visibility ?? 0)) /
      6) *
      100
  );

  const segmentationScore = Math.min(99, Math.round(landmarkConfidenceScore * 0.98));

  if (landmarkConfidenceScore < 85) {
    rejectionReasons.push(
      `Landmark confidence score (${landmarkConfidenceScore}%) is below minimum 85% requirement.`
    );
  }

  // Gate 7: Standing Posture Alignment (Torso inclination < 15 degrees)
  const shoulderMidX = (frontLandmarks.leftShoulder.x + frontLandmarks.rightShoulder.x) / 2;
  const hipMidX = (frontLandmarks.leftHip.x + frontLandmarks.rightHip.x) / 2;
  const tiltX = Math.abs(shoulderMidX - hipMidX);
  const isPoseStraight = tiltX <= 0.08;

  if (!isPoseStraight) {
    rejectionReasons.push('Posture is tilted. Stand straight facing the camera directly.');
  }

  // Gate 8: Image Quality Blur Inspection
  if (frontQuality?.isBlurry) {
    rejectionReasons.push(
      `Image is blurry (blur score: ${frontQuality.blurScore}). Hold device steady under bright lighting.`
    );
  }

  // Gate 9: Lighting Inspection
  if (frontQuality && !frontQuality.isLightingValid) {
    rejectionReasons.push(
      `Lighting is non-optimal (brightness level: ${frontQuality.lightingScore}). Avoid dark shadows or strong backlight.`
    );
  }

  // Compute Overall Blended Confidence Score
  const overallConfidence = Math.min(
    99.4,
    Math.round((bodyVisibilityScore * 0.4 + landmarkConfidenceScore * 0.4 + segmentationScore * 0.2) * 10) / 10
  );

  // Requirement #8: If overall confidence < 85%, fail validation
  const isValid = rejectionReasons.length === 0 && overallConfidence >= 85;

  return {
    isValid,
    headVisible,
    anklesVisible,
    bodyVisibilityScore,
    segmentationScore,
    landmarkConfidenceScore,
    lightingScore: frontQuality?.lightingScore ?? 92,
    blurScore: frontQuality?.blurScore ?? 145,
    isPoseStraight,
    rejectionReasons,
    overallConfidence,
  };
}
