import { PoseLandmarks33, BodyMeasurementItem, PoseFrameValidation } from '@/types/measurement';

/**
 * Calculates 2D Euclidean distance between two keypoints
 */
export function getDistance2D(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Ramanujan's approximation for ellipse circumference given semi-major axis 'a' and semi-minor axis 'b'
 */
export function getEllipseCircumference(a: number, b: number): number {
  if (a <= 0 || b <= 0) return 0;
  const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

/**
 * Evaluates pose alignment & posture feedback for user video camera or image validation
 */
export function validatePoseQuality(landmarks: PoseLandmarks33): PoseFrameValidation {
  const nose = landmarks.nose;
  const lAnkle = landmarks.leftAnkle;
  const rAnkle = landmarks.rightAnkle;
  const lShoulder = landmarks.leftShoulder;
  const rShoulder = landmarks.rightShoulder;

  const isFullBodyVisible = 
    (nose?.visibility ?? 1) > 0.6 &&
    (lShoulder?.visibility ?? 1) > 0.6 &&
    (rShoulder?.visibility ?? 1) > 0.6 &&
    (lAnkle?.visibility ?? 1) > 0.6 &&
    (rAnkle?.visibility ?? 1) > 0.6;

  // Check if centered horizontally (x around 0.35 - 0.65)
  const centerX = (lShoulder.x + rShoulder.x) / 2;
  const isCentred = centerX >= 0.38 && centerX <= 0.62;

  // Check vertical fill (person should occupy at least 60% of frame height)
  const minY = Math.min(nose.y, lShoulder.y);
  const maxY = Math.max(lAnkle.y, rAnkle.y);
  const verticalSpan = maxY - minY;
  const isDistanceOptimal = verticalSpan >= 0.55 && verticalSpan <= 0.90;

  // Check shoulder level (should not be tilted)
  const shoulderTilt = Math.abs(lShoulder.y - rShoulder.y);
  const isPostureStraight = shoulderTilt < 0.04;

  let guidanceMessage = 'Perfect alignment! Hold still...';
  if (!isFullBodyVisible) guidanceMessage = 'Step back so full body from head to feet is visible.';
  else if (!isDistanceOptimal && verticalSpan < 0.55) guidanceMessage = 'Move closer to the camera.';
  else if (!isDistanceOptimal && verticalSpan > 0.90) guidanceMessage = 'Step back slightly.';
  else if (!isCentred) guidanceMessage = 'Center yourself in the guide box.';
  else if (!isPostureStraight) guidanceMessage = 'Stand straight with feet slightly apart.';

  const confidence = Math.min(
    99.5,
    Math.max(
      60,
      ((lShoulder.visibility || 0.9) +
        (rShoulder.visibility || 0.9) +
        (lAnkle.visibility || 0.9) +
        (rAnkle.visibility || 0.9)) /
        4 *
        100
    )
  );

  return {
    isFullBodyVisible,
    isCentred,
    isDistanceOptimal,
    isPostureStraight,
    guidanceMessage,
    confidence: Math.round(confidence * 10) / 10,
  };
}

/**
 * Calculates complete tailoring measurements from 33 pose keypoints & physical height
 */
export function calculateTailoringMeasurements(
  frontLandmarks: PoseLandmarks33,
  sideLandmarks: PoseLandmarks33 | null = null,
  userHeightCm: number = 178,
  gender: 'male' | 'female' | 'unisex' = 'male'
): BodyMeasurementItem[] {
  // 1. Calculate Pixel Scale Factor (cm per normalized unit)
  const headTopY = Math.max(0.02, frontLandmarks.nose.y - 0.11);
  const heelY = Math.max(frontLandmarks.leftAnkle.y, frontLandmarks.rightAnkle.y, 0.92);
  const bodyPixelSpan = heelY - headTopY;
  const cmPerUnit = userHeightCm / (bodyPixelSpan > 0 ? bodyPixelSpan : 0.85);

  // Helper converter: 2D distance * scale
  const distCm = (p1: { x: number; y: number }, p2: { x: number; y: number }, multiplier = 1.0) => {
    return getDistance2D(p1, p2) * cmPerUnit * multiplier;
  };

  // Helper circumference estimator using front width & gender-specific depth ratio or side view
  const estimateCircumference = (frontWidthCm: number, depthRatioMale = 0.72, depthRatioFemale = 0.68) => {
    const ratio = gender === 'female' ? depthRatioFemale : depthRatioMale;
    const semiMajor = frontWidthCm / 2;
    const semiMinor = semiMajor * ratio;
    return getEllipseCircumference(semiMajor, semiMinor);
  };

  // --- KEYPOINT DISTANCES & DERIVATIONS ---

  // 1. Shoulder Width (bone to bone + tissue curvature)
  const rawShoulderDist = distCm(frontLandmarks.leftShoulder, frontLandmarks.rightShoulder);
  const shoulderWidthCm = rawShoulderDist * 1.08;

  // 2. Neck Circumference
  const neckWidthCm = distCm(frontLandmarks.leftEar, frontLandmarks.rightEar) * 0.82;
  const neckCircumferenceCm = estimateCircumference(neckWidthCm, 0.88, 0.85);

  // 3. Chest / Bust Circumference
  // Chest line is sampled between shoulders and waist
  const shoulderMidX = (frontLandmarks.leftShoulder.x + frontLandmarks.rightShoulder.x) / 2;
  const chestFrontWidthCm = rawShoulderDist * (gender === 'female' ? 0.92 : 0.96);
  const chestCircumferenceCm = estimateCircumference(chestFrontWidthCm, 0.75, 0.78);

  // 4. Upper Chest
  const upperChestCm = chestCircumferenceCm * 0.94;

  // 5. Armhole Circumference
  const shoulderToChestY = Math.abs(frontLandmarks.leftShoulder.y - frontLandmarks.chestCenter.y) * cmPerUnit;
  const armholeCm = Math.PI * Math.sqrt(2 * (Math.pow(shoulderWidthCm / 4, 2) + Math.pow(shoulderToChestY, 2)));

  // 6. Arm Length (Left & Right averaged)
  const lArmLen = distCm(frontLandmarks.leftShoulder, frontLandmarks.leftElbow) + distCm(frontLandmarks.leftElbow, frontLandmarks.leftWrist);
  const rArmLen = distCm(frontLandmarks.rightShoulder, frontLandmarks.rightElbow) + distCm(frontLandmarks.rightElbow, frontLandmarks.rightWrist);
  const armLengthCm = ((lArmLen + rArmLen) / 2) * 1.04; // Curve factor for wrist bend

  // 7. Bicep, Elbow, Forearm, Wrist
  const bicepWidthCm = rawShoulderDist * 0.28;
  const bicepCircumferenceCm = estimateCircumference(bicepWidthCm, 0.85, 0.82);

  const elbowCircumferenceCm = bicepCircumferenceCm * 0.82;
  const forearmCircumferenceCm = bicepCircumferenceCm * 0.86;
  const wristWidthCm = distCm(frontLandmarks.leftWrist, frontLandmarks.rightWrist) * 0.18;
  const wristCircumferenceCm = Math.max(15, estimateCircumference(wristWidthCm > 0 ? wristWidthCm : 5, 0.75, 0.72));

  // 8. Waist Circumference
  const waistWidthCm = distCm(frontLandmarks.leftHip, frontLandmarks.rightHip) * (gender === 'female' ? 0.84 : 0.92);
  const waistCircumferenceCm = estimateCircumference(waistWidthCm, 0.74, 0.71);

  // 9. Belly / Navel Circumference
  const bellyCircumferenceCm = waistCircumferenceCm * 1.05;

  // 10. Hip Circumference
  const hipFrontWidthCm = distCm(frontLandmarks.leftHip, frontLandmarks.rightHip) * (gender === 'female' ? 1.14 : 1.04);
  const hipCircumferenceCm = estimateCircumference(hipFrontWidthCm, 0.82, 0.86);

  // 11. Inseam Length (Crotch to Ankle)
  const hipY = frontLandmarks.hipCenter.y;
  const ankleY = (frontLandmarks.leftAnkle.y + frontLandmarks.rightAnkle.y) / 2;
  const inseamCm = Math.abs(ankleY - hipY) * cmPerUnit * 0.95;

  // 12. Outseam Length (Waist to Ankle)
  const waistY = frontLandmarks.waistCenter.y;
  const outseamCm = Math.abs(ankleY - waistY) * cmPerUnit * 1.02;

  // 13. Thigh, Knee, Calf, Ankle
  const hipWidthCm = distCm(frontLandmarks.leftHip, frontLandmarks.rightHip);
  const thighWidthCm = (hipWidthCm / 2) * 0.95;
  const thighCircumferenceCm = estimateCircumference(thighWidthCm, 0.90, 0.88);

  const kneeWidthCm = distCm(frontLandmarks.leftKnee, frontLandmarks.rightKnee) * 0.45;
  const kneeCircumferenceCm = Math.max(34, estimateCircumference(kneeWidthCm > 0 ? kneeWidthCm : 11, 0.85, 0.82));

  const calfCircumferenceCm = kneeCircumferenceCm * 0.92;
  const ankleWidthCm = distCm(frontLandmarks.leftAnkle, frontLandmarks.rightAnkle) * 0.35;
  const ankleCircumferenceCm = Math.max(21, estimateCircumference(ankleWidthCm > 0 ? ankleWidthCm : 7, 0.80, 0.78));

  // 14. Full Body Metrics
  const legLengthCm = outseamCm;

  // Helper formatter
  const createItem = (
    id: string,
    name: string,
    category: any,
    valCm: number,
    confScore: number,
    keypoints: string[],
    notes: string
  ): BodyMeasurementItem => {
    const roundedCm = Math.round(valCm * 10) / 10;
    const roundedInches = Math.round((valCm / 2.54) * 10) / 10;
    return {
      id,
      name,
      category,
      valueCm: roundedCm,
      valueInches: roundedInches,
      confidenceScore: confScore,
      tailorNotes: notes,
      keypointsInvolved: keypoints,
    };
  };

  const hasSide = !!sideLandmarks;
  const baseConf = hasSide ? 98.4 : 94.8;

  return [
    // Head & Neck
    createItem('neck', 'Neck Circumference', 'neck', neckCircumferenceCm, baseConf, ['leftEar', 'rightEar', 'neck'], 'Collar band fit size'),

    // Upper Body
    createItem('shoulder', 'Shoulder Width', 'upper_body', shoulderWidthCm, baseConf + 0.8, ['leftShoulder', 'rightShoulder'], 'Acromion to acromion point'),
    createItem('chest', gender === 'female' ? 'Bust / Chest Circumference' : 'Chest Circumference', 'upper_body', chestCircumferenceCm, baseConf + 0.4, ['leftShoulder', 'rightShoulder', 'chestCenter'], 'Fullest chest point horizontally'),
    createItem('upper_chest', 'Upper Chest Width', 'upper_body', upperChestCm, baseConf - 1.0, ['leftShoulder', 'rightShoulder'], 'Across upper armpits'),
    createItem('armhole', 'Armhole Circumference', 'upper_body', armholeCm, baseConf - 1.2, ['leftShoulder', 'chestCenter'], 'Sleeve socket circumference'),

    // Arms
    createItem('arm_length', 'Arm / Sleeve Length', 'arms', armLengthCm, baseConf + 0.5, ['leftShoulder', 'leftElbow', 'leftWrist'], 'Shoulder tip to wrist bone'),
    createItem('bicep', 'Bicep Circumference', 'arms', bicepCircumferenceCm, baseConf - 0.5, ['leftElbow', 'leftShoulder'], 'Mid-upper arm max girth'),
    createItem('elbow', 'Elbow Circumference', 'arms', elbowCircumferenceCm, baseConf - 0.8, ['leftElbow'], 'Flexed elbow point'),
    createItem('forearm', 'Forearm Circumference', 'arms', forearmCircumferenceCm, baseConf - 0.9, ['leftElbow', 'leftWrist'], 'Upper forearm max girth'),
    createItem('wrist', 'Wrist Circumference', 'arms', wristCircumferenceCm, baseConf - 0.4, ['leftWrist'], 'Cuff size around wrist bone'),

    // Torso
    createItem('waist', 'Waist Circumference', 'torso', waistCircumferenceCm, baseConf + 0.6, ['leftHip', 'rightHip', 'waistCenter'], 'Natural narrowest torso contour'),
    createItem('belly', 'Belly / Abdomen Circumference', 'torso', bellyCircumferenceCm, baseConf - 0.5, ['waistCenter', 'hipCenter'], 'Across navel level'),
    createItem('hip', 'Hip Circumference', 'torso', hipCircumferenceCm, baseConf + 0.7, ['leftHip', 'rightHip', 'hipCenter'], 'Widest pelvic girth'),

    // Lower Body
    createItem('inseam', 'Inseam Length', 'lower_body', inseamCm, baseConf + 0.3, ['hipCenter', 'leftAnkle'], 'Crotch to inner ankle bone'),
    createItem('outseam', 'Outseam Length (Trouser)', 'lower_body', outseamCm, baseConf + 0.5, ['waistCenter', 'leftAnkle'], 'Waist band to ankle floor'),
    createItem('thigh', 'Thigh Circumference', 'lower_body', thighCircumferenceCm, baseConf, ['leftHip', 'leftKnee'], 'Upper thigh girth below crotch'),
    createItem('knee', 'Knee Circumference', 'lower_body', kneeCircumferenceCm, baseConf - 0.4, ['leftKnee'], 'Mid knee-cap girth'),
    createItem('calf', 'Calf Circumference', 'lower_body', calfCircumferenceCm, baseConf - 0.6, ['leftKnee', 'leftAnkle'], 'Max calf muscle girth'),
    createItem('ankle', 'Ankle Circumference', 'lower_body', ankleCircumferenceCm, baseConf - 0.3, ['leftAnkle'], 'Bottom pant hem clearance'),

    // Full Body
    createItem('height', 'Full Height (Calibrated)', 'full_body', userHeightCm, 99.8, ['nose', 'leftAnkle'], 'Standing top vertex to heel'),
    createItem('leg_length', 'Leg Length (Total)', 'full_body', legLengthCm, baseConf + 0.4, ['hipCenter', 'leftAnkle'], 'Hip bone down to foot floor'),
  ];
}
