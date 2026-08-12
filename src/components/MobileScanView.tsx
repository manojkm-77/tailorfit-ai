'use client';

import React, { useState } from 'react';
import { Camera, UploadCloud, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PhotoUploadScan } from '@/components/PhotoUploadScan';
import { LiveCameraScan } from '@/components/LiveCameraScan';
import { PoseLandmarks33 } from '@/types/measurement';
import { AccuracyValidationResult } from '@/lib/validationEngine';

interface MobileScanViewProps {
  userHeightCm: number;
  gender: 'male' | 'female';
  onGenderChange: (g: 'male' | 'female') => void;
  onPoseCaptured: (
    imageUri: string,
    landmarks: PoseLandmarks33,
    gender: 'male' | 'female',
    sideLandmarks: PoseLandmarks33 | null,
    validation: AccuracyValidationResult | null
  ) => void;
}

export const MobileScanView: React.FC<MobileScanViewProps> = ({
  userHeightCm,
  gender,
  onGenderChange,
  onPoseCaptured,
}) => {
  const [scanMode, setScanMode] = useState<'photo' | 'camera'>('photo');

  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto sm:max-w-xl pb-20 sm:pb-0">
      {/* Mode Switcher */}
      <div className="wellness-card p-4 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-sm text-[#1a2e30]">Scan Studio Mode</h2>
          <p className="text-[11px] text-[#5b7173]">Select multi-view capture method</p>
        </div>

        <div className="flex items-center gap-1 bg-[#ebf3f2] p-1 rounded-full text-xs">
          <button
            onClick={() => setScanMode('photo')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
              scanMode === 'photo' ? 'bg-[#0d484b] text-white shadow' : 'text-[#5b7173]'
            }`}
          >
            Photo Upload
          </button>
          <button
            onClick={() => setScanMode('camera')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
              scanMode === 'camera' ? 'bg-[#0d484b] text-white shadow' : 'text-[#5b7173]'
            }`}
          >
            Live Camera
          </button>
        </div>
      </div>

      {/* Main Studio View */}
      {scanMode === 'photo' ? (
        <PhotoUploadScan
          onProcessImages={(front, _side, _back, fLms, sLms, _bLms, g, val) =>
            onPoseCaptured(front, fLms, g, sLms, val)
          }
          selectedGender={gender}
          onGenderChange={onGenderChange}
          onSwitchToCamera={() => setScanMode('camera')}
          userHeightCm={userHeightCm}
        />
      ) : (
        <LiveCameraScan
          userHeightCm={userHeightCm}
          onCapture={(img, lms) => onPoseCaptured(img, lms, gender, null, null)}
          onSwitchToPhoto={() => setScanMode('photo')}
        />
      )}
    </div>
  );
};
