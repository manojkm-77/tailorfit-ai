'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { LiveCameraScan } from '@/components/LiveCameraScan';
import { PhotoUploadScan } from '@/components/PhotoUploadScan';
import { VisualLandmarkCanvas } from '@/components/VisualLandmarkCanvas';
import { MeasurementResults } from '@/components/MeasurementResults';
import { TailorReportModal } from '@/components/TailorReportModal';
import { TailorDashboard } from '@/components/TailorDashboard';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import { AccuracyEngineInfo } from '@/components/AccuracyEngineInfo';

import { PoseLandmarks33, BodyMeasurementItem } from '@/types/measurement';
import { SAMPLE_MALE_LANDMARKS, MALE_MODEL_SVG } from '@/lib/sampleModels';
import { calculateTailoringMeasurements } from '@/lib/measurementEngine';
import { Camera, Upload, Sparkles, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'scan' | 'tailor' | 'customer' | 'accuracy'>('scan');
  const [scanMode, setScanMode] = useState<'live_camera' | 'photo_upload'>('photo_upload');

  // Calibration State
  const [userHeightCm, setUserHeightCm] = useState<number>(180);
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [gender, setGender] = useState<'male' | 'female' | 'unisex'>('male');

  // Scan Capture State
  const [scannedImage, setScannedImage] = useState<string | null>(MALE_MODEL_SVG);
  const [landmarks, setLandmarks] = useState<PoseLandmarks33 | null>(SAMPLE_MALE_LANDMARKS);

  // Calculated Measurements State
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Responsive Header Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userHeightCm={userHeightCm}
        onHeightChange={handleHeightChange}
        unit={unit}
        onUnitChange={setUnit}
      />

      {/* Main App Workspace View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8">
        {activeTab === 'scan' && (
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Scan Mode Switcher Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>AI Human Body Scan Studio</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload multi-angle photos or use live video camera to generate 20+ tailoring circumferences.
                </p>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs w-full sm:w-auto">
                <button
                  onClick={() => setScanMode('photo_upload')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    scanMode === 'photo_upload'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Photo Studio</span>
                </button>

                <button
                  onClick={() => setScanMode('live_camera')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    scanMode === 'live_camera'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Video Scanner</span>
                </button>
              </div>
            </div>

            {/* Input Capture Section */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
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

            {/* Dual Column Visualizer & Measurement Specs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Visual Landmark Canvas (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <h3 className="font-bold text-slate-200 text-sm sm:text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>33-Point MediaPipe Pose Visualizer</span>
                </h3>

                <VisualLandmarkCanvas
                  imageSrc={scannedImage}
                  landmarks={landmarks}
                  measurements={measurements}
                  unit={unit}
                  width={520}
                  height={720}
                />
              </div>

              {/* Right Column: Tailoring Measurements Grid (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <MeasurementResults
                  measurements={measurements}
                  unit={unit}
                  onUnitChange={setUnit}
                  onUpdateMeasurement={handleUpdateMeasurement}
                  onOpenPdfReport={() => setIsPdfModalOpen(true)}
                  overallConfidence={overallConfidence}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tailor Portal */}
        {activeTab === 'tailor' && (
          <TailorDashboard onSelectScan={() => setActiveTab('scan')} />
        )}

        {/* Customer Portal */}
        {activeTab === 'customer' && (
          <CustomerDashboard
            currentMeasurements={measurements}
            onOpenReport={() => setIsPdfModalOpen(true)}
            unit={unit}
          />
        )}

        {/* AI Spec Engine Architecture */}
        {activeTab === 'accuracy' && <AccuracyEngineInfo />}
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
