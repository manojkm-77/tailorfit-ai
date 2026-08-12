'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav, MobileTab } from '@/components/BottomNav';

import { MobileHomeView } from '@/components/MobileHomeView';
import { MobileScanView } from '@/components/MobileScanView';
import { MeasurementHistoryView } from '@/components/MeasurementHistoryView';
import { MobileReportsView } from '@/components/MobileReportsView';
import { MobileProfileView } from '@/components/MobileProfileView';

import { ProcessingView } from '@/components/ProcessingView';
import { MeasurementResults } from '@/components/MeasurementResults';
import { TailorDashboard } from '@/components/TailorDashboard';
import { TailorReportModal } from '@/components/TailorReportModal';

import { PoseLandmarks33, BodyMeasurementItem } from '@/types/measurement';
import { SAMPLE_MALE_LANDMARKS } from '@/lib/sampleModels';
import { calculateTailoringMeasurements } from '@/lib/measurementEngine';
import { AccuracyValidationResult, validateStrictQualityGates } from '@/lib/validationEngine';

export default function Home() {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [activeSubView, setActiveSubView] = useState<'normal' | 'processing' | 'results' | 'tailor_dashboard'>('normal');

  // Calibration State
  const [userHeightCm, setUserHeightCm] = useState<number>(180);
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Capture & Quality State
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<PoseLandmarks33 | null>(SAMPLE_MALE_LANDMARKS);
  const [validationResult, setValidationResult] = useState<AccuracyValidationResult | null>(() =>
    validateStrictQualityGates(SAMPLE_MALE_LANDMARKS, SAMPLE_MALE_LANDMARKS)
  );

  // Measurements State
  const [measurements, setMeasurements] = useState<BodyMeasurementItem[]>(() =>
    calculateTailoringMeasurements(SAMPLE_MALE_LANDMARKS, null, 180, 'male')
  );

  // PDF Report Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Process pose capture -> transition to processing -> results
  const handlePoseCaptured = (
    imageUri: string,
    detectedLandmarks: PoseLandmarks33,
    selectedGender: 'male' | 'female' = 'male',
    sideLandmarks: PoseLandmarks33 | null = null,
    validation: AccuracyValidationResult | null = null
  ) => {
    setScannedImage(imageUri);
    setLandmarks(detectedLandmarks);
    setGender(selectedGender);

    if (validation) {
      setValidationResult(validation);
    } else {
      setValidationResult(validateStrictQualityGates(detectedLandmarks, sideLandmarks));
    }

    const calculated = calculateTailoringMeasurements(
      detectedLandmarks,
      sideLandmarks,
      userHeightCm,
      selectedGender
    );
    setMeasurements(calculated);
    setActiveSubView('processing');
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

  const overallConfidence = validationResult?.overallConfidence ?? 98.4;

  const handleTabChange = (tab: MobileTab) => {
    setActiveTab(tab);
    setActiveSubView('normal');
  };

  return (
    <div className="min-h-screen bg-[#ebf3f2] text-[#1a2e30] flex flex-col font-sans">
      {/* Top Header Navigation */}
      <Header
        activePage={activeTab === 'scan' ? 'photo_upload' : (activeTab as any)}
        onNavigate={(p) => {
          if (p === 'tailor_dashboard') {
            setActiveSubView('tailor_dashboard');
          } else if (p === 'photo_upload') {
            handleTabChange('scan');
          } else if (p === 'history') {
            handleTabChange('history');
          } else {
            handleTabChange('home');
          }
        }}
        userHeightCm={userHeightCm}
        onHeightChange={handleHeightChange}
        unit={unit}
        onUnitChange={setUnit}
      />

      {/* Main Page Content Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center">
        {/* Processing Subview */}
        {activeSubView === 'processing' && (
          <ProcessingView onComplete={() => setActiveSubView('results')} />
        )}

        {/* Results Subview */}
        {activeSubView === 'results' && (
          <MeasurementResults
            measurements={measurements}
            unit={unit}
            onUnitChange={setUnit}
            onUpdateMeasurement={handleUpdateMeasurement}
            onOpenPdfReport={() => setIsPdfModalOpen(true)}
            overallConfidence={overallConfidence}
            validation={validationResult}
            userHeightCm={userHeightCm}
          />
        )}

        {/* Tailor Dashboard Subview */}
        {activeSubView === 'tailor_dashboard' && (
          <TailorDashboard onSelectScan={() => handleTabChange('scan')} />
        )}

        {/* Normal Views */}
        {activeSubView === 'normal' && (
          <>
            {activeTab === 'home' && (
              <MobileHomeView
                onTabChange={handleTabChange}
                measurements={measurements}
                unit={unit}
                userHeightCm={userHeightCm}
              />
            )}

            {activeTab === 'scan' && (
              <MobileScanView
                userHeightCm={userHeightCm}
                gender={gender}
                onGenderChange={setGender}
                onPoseCaptured={handlePoseCaptured}
              />
            )}

            {activeTab === 'history' && (
              <MeasurementHistoryView
                onNavigate={(p) => (p === 'photo_upload' ? handleTabChange('scan') : handleTabChange('home'))}
                unit={unit}
              />
            )}

            {activeTab === 'reports' && (
              <MobileReportsView
                onOpenPdfReport={() => setIsPdfModalOpen(true)}
                measurements={measurements}
                unit={unit}
                userHeightCm={userHeightCm}
              />
            )}

            {activeTab === 'profile' && (
              <MobileProfileView
                userHeightCm={userHeightCm}
                onHeightChange={handleHeightChange}
                gender={gender}
                onGenderChange={setGender}
                unit={unit}
                onUnitChange={setUnit}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Mobile Navigation Dock */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

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
