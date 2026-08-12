'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { StepWizardNav, StepId } from '@/components/StepWizardNav';
import { LiveCameraScan } from '@/components/LiveCameraScan';
import { PhotoUploadScan } from '@/components/PhotoUploadScan';
import { VisualLandmarkCanvas } from '@/components/VisualLandmarkCanvas';
import { MeasurementResults } from '@/components/MeasurementResults';
import { TailorReportModal } from '@/components/TailorReportModal';
import { TailorDashboard } from '@/components/TailorDashboard';

import { PoseLandmarks33, BodyMeasurementItem } from '@/types/measurement';
import { SAMPLE_MALE_LANDMARKS, MALE_MODEL_SVG } from '@/lib/sampleModels';
import { calculateTailoringMeasurements } from '@/lib/measurementEngine';
import { Camera, Upload, SlidersHorizontal, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [activeNav, setActiveNav] = useState<'wizard' | 'orders'>('wizard');
  const [wizardStep, setWizardStep] = useState<StepId>(1);
  const [scanMode, setScanMode] = useState<'photo_upload' | 'live_camera'>('photo_upload');

  // Calibration State
  const [userHeightCm, setUserHeightCm] = useState<number>(180);
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [gender, setGender] = useState<'male' | 'female'>('male');

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
    setWizardStep(3); // Advance to Step 3 Review Specs
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
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col font-sans">
      {/* Header Navigation Bar */}
      <Header
        activeTab={activeNav}
        onTabChange={setActiveNav}
        userHeightCm={userHeightCm}
        onHeightChange={handleHeightChange}
        unit={unit}
        onUnitChange={setUnit}
      />

      {/* Main Workspace View */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8">
        {activeNav === 'wizard' ? (
          <div className="flex flex-col gap-6">
            {/* 4-Step Guided Wizard Progress Header */}
            <StepWizardNav currentStep={wizardStep} onStepClick={setWizardStep} />

            {/* STEP 1: CALIBRATION */}
            {wizardStep === 1 && (
              <div className="p-6 rounded-2xl bg-[#111318] border border-[#222630] flex flex-col gap-6">
                <div>
                  <h1 className="text-xl font-extrabold text-white">Step 1: Calibration &amp; Fitting Profile</h1>
                  <p className="text-xs text-[#8b90a0] mt-1">
                    Set your standing height scale and select your anatomical fitting model.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Height Input Card */}
                  <div className="p-5 rounded-xl bg-[#181b22] border border-[#222630] flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#8b90a0]">
                      <SlidersHorizontal className="w-4 h-4 text-white" />
                      <span className="font-bold text-white">Standing Height Scale</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={userHeightCm}
                        onChange={(e) => handleHeightChange(Number(e.target.value) || 180)}
                        className="w-28 px-3 py-2 rounded-xl bg-[#090a0f] border border-white text-white font-mono text-xl font-black text-center outline-none"
                      />
                      <span className="text-sm font-bold text-[#8b90a0]">Centimeters (cm)</span>
                    </div>
                  </div>

                  {/* Fitting Gender Model */}
                  <div className="p-5 rounded-xl bg-[#181b22] border border-[#222630] flex flex-col gap-3">
                    <div className="text-xs font-bold text-white">Fitting Model Profile</div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setGender('male')}
                        className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                          gender === 'male' ? 'bg-white text-black' : 'bg-[#090a0f] text-[#8b90a0] border border-[#222630]'
                        }`}
                      >
                        Male Fitting
                      </button>

                      <button
                        onClick={() => setGender('female')}
                        className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                          gender === 'female' ? 'bg-white text-black' : 'bg-[#090a0f] text-[#8b90a0] border border-[#222630]'
                        }`}
                      >
                        Female Fitting
                      </button>
                    </div>
                  </div>
                </div>

                {/* SINGLE PRIMARY CTA */}
                <div className="flex justify-end pt-4 border-t border-[#222630]">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-white/90 shadow-sm"
                  >
                    <span>Continue to Pose Capture</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: POSE CAPTURE */}
            {wizardStep === 2 && (
              <div className="flex flex-col gap-6">
                <div className="p-4 rounded-xl bg-[#111318] border border-[#222630] flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">Step 2: Pose Capture Studio</h2>
                    <p className="text-xs text-[#8b90a0]">Upload multi-angle photos or stream live video webcam.</p>
                  </div>

                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#181b22] border border-[#222630] text-xs">
                    <button
                      onClick={() => setScanMode('photo_upload')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        scanMode === 'photo_upload' ? 'bg-white text-black' : 'text-[#8b90a0] hover:text-white'
                      }`}
                    >
                      Photo Studio
                    </button>
                    <button
                      onClick={() => setScanMode('live_camera')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        scanMode === 'live_camera' ? 'bg-white text-black' : 'text-[#8b90a0] hover:text-white'
                      }`}
                    >
                      Live Video Scanner
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#111318] border border-[#222630]">
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
                      selectedGender={gender}
                      onGenderChange={setGender}
                    />
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW SPECS */}
            {wizardStep === 3 && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Visualizer Canvas (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-3">
                    <div className="font-bold text-white text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>33-Point MediaPipe Landmark Canvas</span>
                    </div>

                    <VisualLandmarkCanvas
                      imageSrc={scannedImage}
                      landmarks={landmarks}
                      measurements={measurements}
                      unit={unit}
                      width={480}
                      height={640}
                    />
                  </div>

                  {/* 20 Measurements Specs (7 cols) */}
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

            {/* STEP 4: GARMENT TECH PACK */}
            {wizardStep === 4 && (
              <div className="p-8 rounded-2xl bg-[#111318] border border-[#222630] flex flex-col items-center justify-center text-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-white">Garment Tech Pack Ready</h2>
                  <p className="text-xs text-[#8b90a0] mt-1 max-w-md">
                    All 20 body perimeters and pattern cut sheets have been generated for Master Pattern Cutters.
                  </p>
                </div>

                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-8 py-3.5 rounded-xl bg-white text-black font-extrabold text-sm flex items-center gap-2 hover:bg-white/90 shadow-sm mt-2"
                >
                  <span>Open PDF Tech Pack Specification Report</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* TAILOR PORTAL TAB */
          <TailorDashboard onSelectScan={() => setActiveNav('wizard')} />
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
