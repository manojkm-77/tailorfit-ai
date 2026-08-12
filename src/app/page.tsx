'use client';

import React, { useState } from 'react';
import { Header, PageView } from '@/components/Header';
import { HomePageView } from '@/components/HomePageView';
import { PhotoUploadScan } from '@/components/PhotoUploadScan';
import { LiveCameraScan } from '@/components/LiveCameraScan';
import { ProcessingView } from '@/components/ProcessingView';
import { MeasurementResults } from '@/components/MeasurementResults';
import { MeasurementHistoryView } from '@/components/MeasurementHistoryView';
import { TailorDashboard } from '@/components/TailorDashboard';
import { TailorReportModal } from '@/components/TailorReportModal';

import { PoseLandmarks33, BodyMeasurementItem } from '@/types/measurement';
import { SAMPLE_MALE_LANDMARKS } from '@/lib/sampleModels';
import { calculateTailoringMeasurements } from '@/lib/measurementEngine';

export default function Home() {
  const [activePage, setActivePage] = useState<PageView>('home');

  // Calibration State
  const [userHeightCm, setUserHeightCm] = useState<number>(180);
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Capture State
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<PoseLandmarks33 | null>(SAMPLE_MALE_LANDMARKS);

  // Measurements State
  const [measurements, setMeasurements] = useState<BodyMeasurementItem[]>(() =>
    calculateTailoringMeasurements(SAMPLE_MALE_LANDMARKS, null, 180, 'male')
  );

  // PDF Report Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Process image capture -> transition to Processing -> transition to Results
  const handlePoseCaptured = (
    imageUri: string,
    detectedLandmarks: PoseLandmarks33,
    selectedGender: 'male' | 'female' = 'male',
    sideLandmarks: PoseLandmarks33 | null = null
  ) => {
    setScannedImage(imageUri);
    setLandmarks(detectedLandmarks);
    setGender(selectedGender);

    const calculated = calculateTailoringMeasurements(
      detectedLandmarks,
      sideLandmarks,
      userHeightCm,
      selectedGender
    );
    setMeasurements(calculated);
    setActivePage('processing');
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
            tailorNotes: `${m.tailorNotes} (Fine-tuned)`,
          };
        }
        return m;
      })
    );
  };

  const overallConfidence = 98.4;

  return (
    <div className="min-h-screen bg-[#ebf3f2] text-[#1a2e30] flex flex-col font-sans">
      {/* Header Navigation Bar */}
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        userHeightCm={userHeightCm}
        onHeightChange={handleHeightChange}
        unit={unit}
        onUnitChange={setUnit}
      />

      {/* Main Page Workspace View */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center">
        {/* Page 1: Home */}
        {activePage === 'home' && (
          <HomePageView
            onNavigate={setActivePage}
            measurements={measurements}
            unit={unit}
            userHeightCm={userHeightCm}
          />
        )}

        {/* Page 2: Photo Upload */}
        {activePage === 'photo_upload' && (
          <PhotoUploadScan
            onProcessImages={(front, _side, _back, fLms, sLms, _bLms, g) =>
              handlePoseCaptured(front, fLms, g, sLms)
            }
            selectedGender={gender}
            onGenderChange={setGender}
            onSwitchToCamera={() => setActivePage('camera_scan')}
          />
        )}

        {/* Page 3: Camera Scan */}
        {activePage === 'camera_scan' && (
          <LiveCameraScan
            userHeightCm={userHeightCm}
            onCapture={(img, lms) => handlePoseCaptured(img, lms, gender)}
            onSwitchToPhoto={() => setActivePage('photo_upload')}
          />
        )}

        {/* Page 4: Processing */}
        {activePage === 'processing' && (
          <ProcessingView onComplete={() => setActivePage('results')} />
        )}

        {/* Page 5: Results */}
        {activePage === 'results' && (
          <MeasurementResults
            measurements={measurements}
            unit={unit}
            onUnitChange={setUnit}
            onUpdateMeasurement={handleUpdateMeasurement}
            onOpenPdfReport={() => setIsPdfModalOpen(true)}
            overallConfidence={overallConfidence}
          />
        )}

        {/* Page 6: Measurement History */}
        {activePage === 'history' && (
          <MeasurementHistoryView onNavigate={setActivePage} unit={unit} />
        )}

        {/* Page 7: Tailor Dashboard */}
        {activePage === 'tailor_dashboard' && (
          <TailorDashboard onSelectScan={() => setActivePage('photo_upload')} />
        )}
      </main>

      {/* Printable Tailor PDF Tech Pack Report Modal */}
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
    </div>
  );
}
