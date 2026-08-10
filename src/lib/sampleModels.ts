import { PoseLandmarks33, MeasurementReport, MultiViewCaptureState } from '@/types/measurement';

// Synthetic high-precision sample landmarks for standard Male & Female poses
export const SAMPLE_MALE_LANDMARKS: PoseLandmarks33 = {
  nose: { x: 0.50, y: 0.12, z: 0, visibility: 0.99, name: 'Nose' },
  leftEye: { x: 0.48, y: 0.10, z: -0.01, visibility: 0.99 },
  rightEye: { x: 0.52, y: 0.10, z: -0.01, visibility: 0.99 },
  leftEar: { x: 0.45, y: 0.11, z: 0.02, visibility: 0.98 },
  rightEar: { x: 0.55, y: 0.11, z: 0.02, visibility: 0.98 },
  leftShoulder: { x: 0.35, y: 0.22, z: 0.0, visibility: 0.99, name: 'Left Shoulder' },
  rightShoulder: { x: 0.65, y: 0.22, z: 0.0, visibility: 0.99, name: 'Right Shoulder' },
  leftElbow: { x: 0.31, y: 0.37, z: -0.02, visibility: 0.97, name: 'Left Elbow' },
  rightElbow: { x: 0.69, y: 0.37, z: -0.02, visibility: 0.97, name: 'Right Elbow' },
  leftWrist: { x: 0.29, y: 0.51, z: -0.03, visibility: 0.96, name: 'Left Wrist' },
  rightWrist: { x: 0.71, y: 0.51, z: -0.03, visibility: 0.96, name: 'Right Wrist' },
  leftHip: { x: 0.40, y: 0.52, z: 0.0, visibility: 0.99, name: 'Left Hip' },
  rightHip: { x: 0.60, y: 0.52, z: 0.0, visibility: 0.99, name: 'Right Hip' },
  leftKnee: { x: 0.41, y: 0.72, z: -0.01, visibility: 0.98, name: 'Left Knee' },
  rightKnee: { x: 0.59, y: 0.72, z: -0.01, visibility: 0.98, name: 'Right Knee' },
  leftAnkle: { x: 0.42, y: 0.90, z: 0.0, visibility: 0.98, name: 'Left Ankle' },
  rightAnkle: { x: 0.58, y: 0.90, z: 0.0, visibility: 0.98, name: 'Right Ankle' },
  leftHeel: { x: 0.42, y: 0.93, z: 0.02, visibility: 0.95 },
  rightHeel: { x: 0.58, y: 0.93, z: 0.02, visibility: 0.95 },
  leftFootIndex: { x: 0.41, y: 0.95, z: -0.05, visibility: 0.95 },
  rightFootIndex: { x: 0.59, y: 0.95, z: -0.05, visibility: 0.95 },
  neck: { x: 0.50, y: 0.17, z: 0.0, visibility: 0.99, name: 'Neck Base' },
  chestCenter: { x: 0.50, y: 0.30, z: 0.0, visibility: 0.99, name: 'Chest Center' },
  waistCenter: { x: 0.50, y: 0.44, z: 0.0, visibility: 0.99, name: 'Waist Center' },
  hipCenter: { x: 0.50, y: 0.52, z: 0.0, visibility: 0.99, name: 'Hip Center' }
};

export const SAMPLE_FEMALE_LANDMARKS: PoseLandmarks33 = {
  ...SAMPLE_MALE_LANDMARKS,
  leftShoulder: { x: 0.37, y: 0.22, z: 0.0, visibility: 0.99, name: 'Left Shoulder' },
  rightShoulder: { x: 0.63, y: 0.22, z: 0.0, visibility: 0.99, name: 'Right Shoulder' },
  leftHip: { x: 0.38, y: 0.53, z: 0.0, visibility: 0.99, name: 'Left Hip' },
  rightHip: { x: 0.62, y: 0.53, z: 0.0, visibility: 0.99, name: 'Right Hip' },
  waistCenter: { x: 0.50, y: 0.43, z: 0.0, visibility: 0.99, name: 'Waist Center' },
};

// Standard SVG Data URIs for instant preview when no camera/file uploaded
export const MALE_MODEL_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230b132b"/>
      <stop offset="100%" stop-color="%231c2541"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(%23bg)"/>
  <!-- Silhouette contour -->
  <g fill="%2314213d" stroke="%233a86ff" stroke-width="2" opacity="0.8">
    <ellipse cx="300" cy="100" rx="35" ry="45" />
    <path d="M 280 145 L 320 145 L 390 176 L 415 296 L 430 408 L 400 412 L 385 300 L 360 416 L 355 576 L 348 720 L 325 720 L 320 576 L 300 440 L 280 576 L 275 720 L 252 720 L 245 576 L 240 416 L 215 300 L 200 412 L 170 408 L 185 296 L 210 176 Z" />
  </g>
  <text x="300" y="770" text-anchor="middle" fill="%238d99ae" font-size="14" font-family="sans-serif">Sample Male Silhouette (180 cm)</text>
</svg>`;

export const FEMALE_MODEL_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230b132b"/>
      <stop offset="100%" stop-color="%231c2541"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(%23bg)"/>
  <!-- Silhouette contour -->
  <g fill="%232b1e3a" stroke="%23ff007f" stroke-width="2" opacity="0.8">
    <ellipse cx="300" cy="100" rx="32" ry="42" />
    <path d="M 282 142 L 318 142 L 375 176 L 395 296 L 405 408 L 380 410 L 368 296 L 348 424 L 358 576 L 344 720 L 325 720 L 318 576 L 300 440 L 282 576 L 276 720 L 256 720 L 242 576 L 252 424 L 232 296 L 220 410 L 195 408 L 205 296 L 225 176 Z" />
  </g>
  <text x="300" y="770" text-anchor="middle" fill="%238d99ae" font-size="14" font-family="sans-serif">Sample Female Silhouette (168 cm)</text>
</svg>`;
