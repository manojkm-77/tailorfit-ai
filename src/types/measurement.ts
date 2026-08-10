export interface Keypoint {
  x: number; // Normalized [0, 1]
  y: number; // Normalized [0, 1]
  z?: number; // Normalized depth
  visibility?: number;
  name?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  heightCm: number;
  weightKg?: number;
  age?: number;
  unitPreference: 'cm' | 'inches';
  createdAt: string;
}

export type MeasurementCategory = 'neck' | 'upper_body' | 'arms' | 'torso' | 'lower_body' | 'full_body';

export interface BodyMeasurementItem {
  id: string;
  name: string;
  category: MeasurementCategory;
  valueCm: number;
  valueInches: number;
  confidenceScore: number; // percentage e.g. 98.2
  tailorNotes: string;
  keypointsInvolved: string[];
}

export interface MeasurementReport {
  id: string;
  customerName: string;
  customerPhone?: string;
  gender: 'male' | 'female' | 'unisex';
  heightCm: number;
  weightKg?: number;
  scanDate: string;
  scannedViews: ('front' | 'side' | 'back')[];
  overallConfidence: number;
  measurements: BodyMeasurementItem[];
  frontImageUrl?: string;
  sideImageUrl?: string;
  backImageUrl?: string;
  tailorNotes?: string;
  garmentType?: string;
}

export interface PoseFrameValidation {
  isFullBodyVisible: boolean;
  isCentred: boolean;
  isDistanceOptimal: boolean;
  isPostureStraight: boolean;
  guidanceMessage: string;
  confidence: number;
}

export interface PoseLandmarks33 {
  nose: Keypoint;
  leftEye: Keypoint;
  rightEye: Keypoint;
  leftEar: Keypoint;
  rightEar: Keypoint;
  leftShoulder: Keypoint;
  rightShoulder: Keypoint;
  leftElbow: Keypoint;
  rightElbow: Keypoint;
  leftWrist: Keypoint;
  rightWrist: Keypoint;
  leftHip: Keypoint;
  rightHip: Keypoint;
  leftKnee: Keypoint;
  rightKnee: Keypoint;
  leftAnkle: Keypoint;
  rightAnkle: Keypoint;
  leftHeel: Keypoint;
  rightHeel: Keypoint;
  leftFootIndex: Keypoint;
  rightFootIndex: Keypoint;
  // Computed virtual landmarks
  neck: Keypoint;
  chestCenter: Keypoint;
  waistCenter: Keypoint;
  hipCenter: Keypoint;
}

export interface MultiViewCaptureState {
  frontImage: string | null;
  sideImage: string | null;
  backImage: string | null;
  frontLandmarks: PoseLandmarks33 | null;
  sideLandmarks: PoseLandmarks33 | null;
  backLandmarks: PoseLandmarks33 | null;
}

export interface TailorOrder {
  orderId: string;
  customerName: string;
  customerPhone: string;
  garmentType: 'Suit' | 'Shirt' | 'Trousers' | 'Blazer' | 'Lehenga' | 'Sherwani' | 'Custom';
  status: 'Pending' | 'In Cutting' | 'Stitching' | 'Fitting Ready' | 'Completed';
  scanId: string;
  date: string;
  assignedTailor: string;
}
