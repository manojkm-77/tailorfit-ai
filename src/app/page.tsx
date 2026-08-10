'use client';

import React, { useState } from 'react';
import { PastelAppFrame } from '@/components/PastelAppFrame';
import { PastelHomeHub } from '@/components/PastelHomeHub';
import { CircularDialGauge } from '@/components/CircularDialGauge';
import { WaveFitGraph } from '@/components/WaveFitGraph';
import { VisualLandmarkCanvas } from '@/components/VisualLandmarkCanvas';
import { MeasurementResults } from '@/components/MeasurementResults';
import { TailorReportModal } from '@/components/TailorReportModal';
import { TailorDashboard } from '@/components/TailorDashboard';
import { LiveCameraScan } from '@/components/LiveCameraScan';
import { PhotoUploadScan } from '@/components/PhotoUploadScan';

import { PoseLandmarks33, BodyMeasurementItem } from '@/types/measurement';
import { SAMPLE_MALE_LANDMARKS, MALE_MODEL_SVG } from '@/lib/sampleModels';
import { calculateTailoringMeasurements } from '@/lib/measurementEngine';
import { Camera, Upload, Sparkles, FileText, ArrowUpRight } from 'lucide-react';

export default function Home() {
  const [activeNav, setActiveNav] = useState<'home' | 'scan' | 'visual' | 'trends' | 'orders' | 'report'>('home');
  const [scanMode, setScanMode] = useState<'photo_upload' | 'live_camera'>('photo_upload');

  // Calibration State
  const [userHeightCm, setUserHeightCm] = useState<number>(180);
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [gender, setGender] = useState<'male' | 'female' | 'unisex'>('male');

  // Scan Capture State
  const [scannedImage, setScannedImage] = useState<string | null>(MALE_MODEL_SVG);
  const [landmarks, setLandmarks] = useState<PoseLandmarks33 | null>(SAMPLE_MALE_LANDMARKS);

  // Measurements State
  const [measurements, setMeasurements] = useState<BodyMeasurementItem[]>(() =>
    calculateTailoringMeasurements(SAMPLE_MALE_LANDMARKS, null, 180, 'male')
  );

  // PDF Report Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Process live camera or uploaded image capture
  const handlePoseCaptured = (
    imageUri: string,
    detectedLandmarks: PoseLandmarks33,
    selectedGender: 'male' | 'female' | 'unisex' = 'male'
  ) => {
    setScannedImage(imageUri);
    setLandmarks(detectedLandmarks);
    setGender(selectedGender);

    const calculated = calculateTailoringMeasurements(
      detectedLandmarks,
      null,
      userHeightCm,
      selectedGender
    );
    setMeasurements(calculated);
  };

  // Height update recalculation
  const handleHeightChange = (newHeight: number) => {
    setUserHeightCm(newHeight);
    if (landmarks) {
      const recalculated = calculateTailoringMeasurements(
        landmarks,
        null,
        newHeight,
        gender
      );
      setMeasurements(recalculated);
    }
  };

  // Manual measurement fine-tuning override
  const handleUpdateMeasurement = (id: string, newValCm: number) => {
    setMeasurements((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const roundedCm = Math.round(newValCm * 10) / 10;
          const roundedInches = Math.round((newValCm / 2.54) * 10) / 10;
          return {
            ...m,
            valueCm: roundedCm,
            valueInches: roundedInches,
            confidenceScore: 99.9,
            tailorNotes: `${m.tailorNotes} (Manually fine-tuned by Master Tailor)`,
          };
        }
        return m;
      })
    );
  };

  const overallConfidence = 98.4;

  return (
    <PastelAppFrame
      activeNav={activeNav}
      onNavChange={(nav) => {
        if (nav === 'report') {
          setIsPdfModalOpen(true);
        } else {
          setActiveNav(nav);
        }
      }}
      userHeightCm={userHeightCm}
      onHeightChange={handleHeightChange}
    >
      {/* 1. HOME TAB (Pastel 4-Card Grid & Daily Reflection Hub) */}
      {activeNav === 'home' && (
        <PastelHomeHub
          measurements={measurements}
          unit={unit}
          onUnitChange={setUnit}
          userHeightCm={userHeightCm}
          gender={gender}
          onSelectGender={(g) => handlePoseCaptured(scannedImage || MALE_MODEL_SVG, landmarks || SAMPLE_MALE_LANDMARKS, g)}
          onNavigateToScan={() => setActiveNav('scan')}
          onOpenReport={() => setIsPdfModalOpen(true)}
        />
      )}

      {/* 2. SCAN TAB */}
      {activeNav === 'scan' && (
        <div className="flex flex-col gap-5 w-full">
          <div className="pastel-card p-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#1c1c1e] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#748e64]" />
              <span>AI Pose Body Scanner</span>
            </h2>

            <div className="flex items-center gap-1 p-1 rounded-full bg-[#fcf8f5] border border-black/5 text-xs">
              <button
                onClick={() => setScanMode('photo_upload')}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  scanMode === 'photo_upload' ? 'bg-[#1c1c1e] text-white' : 'text-[#7c7c82]'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setScanMode('live_camera')}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  scanMode === 'live_camera' ? 'bg-[#1c1c1e] text-white' : 'text-[#7c7c82]'
                }`}
              >
                Camera
              </button>
            </div>
          </div>

          <div className="pastel-card p-4">
            {scanMode === 'live_camera' ? (
              <LiveCameraScan
                userHeightCm={userHeightCm}
                onCapture={(img, lms) => handlePoseCaptured(img, lms, gender)}
              />
            ) : (
              <PhotoUploadScan
                onProcessImages={(front, side, back, lms, g) => handlePoseCaptured(front, lms, g)}
              />
            )}
          </div>

          <MeasurementResults
            measurements={measurements}
            unit={unit}
            onUnitChange={setUnit}
            onUpdateMeasurement={handleUpdateMeasurement}
            onOpenPdfReport={() => setIsPdfModalOpen(true)}
            overallConfidence={overallConfidence}
          />
        </div>
      )}

      {/* 3. VISUAL MESH TAB */}
      {activeNav === 'visual' && (
        <div className="flex flex-col gap-4 w-full">
          <VisualLandmarkCanvas
            imageSrc={scannedImage}
            landmarks={landmarks}
            measurements={measurements}
            unit={unit}
            width={380}
            height={520}
          />
        </div>
      )}

      {/* 4. DIAL & TRENDS TAB */}
      {activeNav === 'trends' && (
        <div className="flex flex-col gap-5 w-full">
          <CircularDialGauge
            overallConfidence={overallConfidence}
            measurements={measurements}
            unit={unit}
            userHeightCm={userHeightCm}
          />
          <WaveFitGraph unit={unit} />
        </div>
      )}

      {/* 5. TAILOR ORDERS TAB */}
      {activeNav === 'orders' && (
        <div className="flex flex-col gap-4 w-full">
          <TailorDashboard onSelectScan={() => setActiveNav('scan')} />
        </div>
      )}

      {/* Printable Tailor PDF Report Modal */}
      <TailorReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        customerName="Marcus Vance"
        gender={gender}
        heightCm={userHeightCm}
        weightKg={76}
        measurements={measurements}
        unit={unit}
        scannedImageSrc={scannedImage}
      />
    </PastelAppFrame>
  );
}
