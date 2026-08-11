'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { ModelHeroCard } from '@/components/ModelHeroCard';
import { CircularDialGauge } from '@/components/CircularDialGauge';
import { WaveFitGraph } from '@/components/WaveFitGraph';
import { LiveCameraScan } from '@/components/LiveCameraScan';
import { PhotoUploadScan } from '@/components/PhotoUploadScan';
import { VisualLandmarkCanvas } from '@/components/VisualLandmarkCanvas';
import { MeasurementResults } from '@/components/MeasurementResults';
import { TailorReportModal } from '@/components/TailorReportModal';
import { TailorDashboard } from '@/components/TailorDashboard';
import { AccuracyEngineInfo } from '@/components/AccuracyEngineInfo';

import { PoseLandmarks33, BodyMeasurementItem } from '@/types/measurement';
import { SAMPLE_MALE_LANDMARKS, MALE_MODEL_SVG } from '@/lib/sampleModels';
import { calculateTailoringMeasurements } from '@/lib/measurementEngine';
import { Camera, Upload, Sparkles, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'scan' | 'trends' | 'visual' | 'orders' | 'accuracy'>('scan');
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
    selectedGender: 'male' | 'female' | 'unisex' = 'male',
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
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col font-sans">
      {/* Header Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userHeightCm={userHeightCm}
        onHeightChange={handleHeightChange}
        unit={unit}
        onUnitChange={setUnit}
        onOpenReport={() => setIsPdfModalOpen(true)}
      />

      {/* Main Workspace View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8">
        {/* 1. SCAN STUDIO TAB */}
        {activeTab === 'scan' && (
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Top Grid: Hero Model Card + Scan Mode Switcher */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Hero Model Card matching Left Phone UI mockup (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <ModelHeroCard
                  gender={gender}
                  onSelectGender={(g) => handlePoseCaptured(scannedImage || MALE_MODEL_SVG, landmarks || SAMPLE_MALE_LANDMARKS, g)}
                  measurements={measurements}
                  unit={unit}
                  scannedImage={scannedImage}
                  userHeightCm={userHeightCm}
                />
              </div>

              {/* Right Column: Camera / Upload Studio & Specs Grid (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* Mode Switcher */}
                <div className="obsidian-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <span>AI Body Pose Capture</span>
                    </h2>
                    <p className="text-xs text-[#9ea0a6] mt-0.5">Upload multi-angle photos or use live camera scanner.</p>
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#18181c] border border-white/10 text-xs w-full sm:w-auto">
                    <button
                      onClick={() => setScanMode('photo_upload')}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                        scanMode === 'photo_upload'
                          ? 'bg-white text-black shadow'
                          : 'text-[#9ea0a6] hover:text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Photo Studio</span>
                    </button>

                    <button
                      onClick={() => setScanMode('live_camera')}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                        scanMode === 'live_camera'
                          ? 'bg-white text-black shadow'
                          : 'text-[#9ea0a6] hover:text-white'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Live Camera</span>
                    </button>
                  </div>
                </div>

                {/* Input Container */}
                <div className="obsidian-card p-4 sm:p-5">
                  {scanMode === 'live_camera' ? (
                    <LiveCameraScan
                      userHeightCm={userHeightCm}
                      onCapture={(img, lms) => handlePoseCaptured(img, lms, gender)}
                    />
                  ) : (
                    <PhotoUploadScan
                      onProcessImages={(front, _side, _back, fLms, sLms, _bLms, g) =>
                        handlePoseCaptured(front, fLms, g, sLms)
                      }
                    />
                  )}
                </div>

                {/* 20 Tailoring Measurements Specs */}
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

        {/* 2. DIAL & TRENDS TAB (Matching Middle & Right Phone UI Mockups) */}
        {activeTab === 'trends' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Middle Screen UI: Circular Radial Dial Gauge (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <CircularDialGauge
                overallConfidence={overallConfidence}
                measurements={measurements}
                unit={unit}
                userHeightCm={userHeightCm}
              />
            </div>

            {/* Right Screen UI: SVG Wave Girth Trend Graph & Checklist (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <WaveFitGraph unit={unit} />
            </div>
          </div>
        )}

        {/* 3. MESH VISUALIZER TAB */}
        {activeTab === 'visual' && (
          <div className="flex flex-col items-center gap-4 w-full">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>33-Point MediaPipe Pose Landmark Visualizer</span>
            </h3>

            <VisualLandmarkCanvas
              imageSrc={scannedImage}
              landmarks={landmarks}
              measurements={measurements}
              unit={unit}
              width={540}
              height={720}
            />
          </div>
        )}

        {/* 4. TAILOR ORDERS TAB */}
        {activeTab === 'orders' && (
          <TailorDashboard onSelectScan={() => setActiveTab('scan')} />
        )}

        {/* 5. AI SPEC ENGINE ARCHITECTURE */}
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
