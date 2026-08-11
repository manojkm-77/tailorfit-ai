import { PoseLandmarks33, Keypoint } from '@/types/measurement';

/**
 * Maps MediaPipe PoseLandmarker's raw 33-landmark array onto the app's
 * PoseLandmarks33 shape, deriving the virtual neck / chest / waist / hip centers.
 * MediaPipe x,y are normalized to [0,1]; z is depth relative to the hip midpoint.
 */

type RawLandmark = { x: number; y: number; z?: number; visibility?: number };

const INDEX: Record<keyof Omit<PoseLandmarks33, 'neck' | 'chestCenter' | 'waistCenter' | 'hipCenter'>, number> = {
  nose: 0,
  leftEye: 2,
  rightEye: 5,
  leftEar: 7,
  rightEar: 8,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFootIndex: 31,
  rightFootIndex: 32,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function at(raw: RawLandmark[], idx: number, name: string): Keypoint {
  const p = raw[idx];
  return { x: p.x, y: p.y, z: p.z, visibility: p.visibility, name };
}

function interpolate(a: Keypoint, b: Keypoint, t: number, name?: string): Keypoint {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: a.z !== undefined && b.z !== undefined ? (a.z + b.z) / 2 : a.z ?? b.z,
    visibility:
      a.visibility !== undefined && b.visibility !== undefined
        ? Math.min(a.visibility, b.visibility)
        : a.visibility ?? b.visibility,
    name,
  };
}

export function mapMediaPipeLandmarks(raw: RawLandmark[]): PoseLandmarks33 | null {
  if (!raw || raw.length < 33) return null;

  const keypoints = {} as Record<keyof Omit<PoseLandmarks33, 'neck' | 'chestCenter' | 'waistCenter' | 'hipCenter'>, Keypoint>;
  (Object.keys(INDEX) as (keyof typeof INDEX)[]).forEach((key) => {
    keypoints[key] = at(raw, INDEX[key], key);
  });

  const shoulderMid = interpolate(keypoints.leftShoulder, keypoints.rightShoulder, 0.5);
  const hipMid = interpolate(keypoints.leftHip, keypoints.rightHip, 0.5);
  const neck = interpolate(keypoints.leftShoulder, keypoints.rightShoulder, 0.5, 'Neck Base');
  const chestCenter = interpolate(shoulderMid, hipMid, 0.27, 'Chest Center');
  const waistCenter = interpolate(shoulderMid, hipMid, 0.73, 'Waist Center');

  return {
    ...keypoints,
    neck,
    chestCenter,
    waistCenter,
    hipCenter: { ...hipMid, name: 'Hip Center' },
  };
}
