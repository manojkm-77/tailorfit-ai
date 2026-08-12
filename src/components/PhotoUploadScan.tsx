'use client';

import React, { useEffect, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { PoseLandmarks33 } from '@/types/measurement';
import { detectPoseFromImage, initPoseDetector } from '@/lib/mediapipeClient';
import { PageView } from './Header';

interface PhotoUploadScanProps {
  onProcessImages: (
    frontImg: string,
    sideImg: string | null,
    backImg: string | null,
    frontLandmarks: PoseLandmarks33,
    sideLandmarks: PoseLandmarks33 | null,
    backLandmarks: PoseLandmarks33 | null,
    gender: 'male' | 'female'
  ) => void;
  selectedGender: 'male' | 'female';
  onGenderChange: (g: 'male' | 'female') => void;
  onSwitchToCamera: () => void;
}

type ViewKey = 'front' | 'side';
type EngineState = 'loading' | 'ready' | 'unavailable';
type ViewDetectState = 'idle' | 'detecting' | 'detected' | 'failed';

const VIEW_LABELS: Record<ViewKey, { title: string; hint: string }> = {
  front: { title: 'Front Photo (Required)', hint: 'Primary Height & Width' },
  side: { title: 'Side Photo (Optional)', hint: '+4% Depth Accuracy' },
};

export const PhotoUploadScan: React.FC<PhotoUploadScanProps> = ({
  onProcessImages,
  selectedGender,
  onGenderChange,
  onSwitchToCamera,
}) => {
  const [engineState, setEngineState] = useState<EngineState>('loading');
  const [images, setImages] = useState<Record<ViewKey, string | null>>({
    front: null,
    side: null,
  });
  const [landmarks, setLandmarks] = useState<Record<ViewKey, PoseLandmarks33 | null>>({
    front: null,
    side: null,
  });
  const [detectStates, setDetectStates] = useState<Record<ViewKey, ViewDetectState>>({
    front: 'idle',
    side: 'idle',
  });
  const [errors, setErrors] = useState<Record<ViewKey, string | null>>({
    front: null,
    side: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    initPoseDetector().then((ok) => {
      if (active) setEngineState(ok ? 'ready' : 'unavailable');
    });
    return () => {
      active = false;
    };
  }, []);

  const runDetectionOnView = async (view: ViewKey, dataUrl: string) => {
    setDetectStates((prev) => ({ ...prev, [view]: 'detecting' }));
    setErrors((prev) => ({ ...prev, [view]: null }));

    try {
      const res = await detectPoseFromImage(dataUrl);
      if (res.landmarks) {
        setLandmarks((prev) => ({ ...prev, [view]: res.landmarks }));
        setDetectStates((prev) => ({ ...prev, [view]: 'detected' }));
      } else {
        setLandmarks((prev) => ({ ...prev, [view]: null }));
        setDetectStates((prev) => ({ ...prev, [view]: 'failed' }));
        setErrors((prev) => ({
          ...prev,
          [view]: 'No full-body pose detected. Ensure full head-to-toe visibility in bright light.',
        }));
      }
    } catch (err) {
      setDetectStates((prev) => ({ ...prev, [view]: 'failed' }));
      setErrors((prev) => ({
        ...prev,
        [view]: err instanceof Error ? err.message : 'Detection failed',
      }));
    }
  };

  const handleFile = (view: ViewKey, file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImages((prev) => ({ ...prev, [view]: result }));
      runDetectionOnView(view, result);
    };
    reader.readAsDataURL(file);
  };

  const canExtract = Boolean(images.front && detectStates.front === 'detected' && landmarks.front);

  const handleExtract = () => {
    if (!canExtract || !landmarks.front || !images.front) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onProcessImages(
        images.front!,
        images.side,
        null,
        landmarks.front!,
        landmarks.side,
        null,
        selectedGender
      );
    }, 300);
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto sm:max-w-xl">
      {/* Header Banner */}
      <div className="wellness-card-green p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#1a2e30]">Photo Upload Scan</h2>
          <button
            onClick={onSwitchToCamera}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#0d484b] text-xs font-bold shadow-sm"
          >
            Use Camera Instead
          </button>
        </div>
        <p className="text-xs text-[#5b7173]">Select front &amp; side body photos for AI fitting calculation.</p>
      </div>

      {/* Fitting Profile Selector */}
      <div className="wellness-card p-4 flex items-center justify-between">
        <span className="text-xs font-bold text-[#1a2e30]">Fitting Model:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGenderChange('male')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedGender === 'male' ? 'bg-[#0d484b] text-white shadow' : 'bg-[#ebf3f2] text-[#5b7173]'
            }`}
          >
            Male Fitting
          </button>
          <button
            onClick={() => onGenderChange('female')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedGender === 'female' ? 'bg-[#0d484b] text-white shadow' : 'bg-[#ebf3f2] text-[#5b7173]'
            }`}
          >
            Female Fitting
          </button>
        </div>
      </div>

      {/* Multi-View Photo Upload Dropzones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(['front', 'side'] as ViewKey[]).map((view) => {
          const info = VIEW_LABELS[view];
          const img = images[view];
          const st = detectStates[view];
          const err = errors[view];
          const isFront = view === 'front';

          return (
            <div key={view} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1a2e30]">
                <span>{info.title}</span>
                <span className="text-[10px] text-[#5b7173]">{info.hint}</span>
              </div>

              <label
                className={`relative flex flex-col items-center justify-center h-52 rounded-3xl border-2 border-dashed bg-white cursor-pointer overflow-hidden transition-all shadow-sm ${
                  st === 'detected'
                    ? 'border-emerald-500'
                    : isFront
                    ? 'border-[#0d484b]/40 hover:border-[#0d484b]'
                    : 'border-[#1a2e30]/15 hover:border-[#1a2e30]/30'
                }`}
              >
                {img ? (
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    <img src={img} alt={view} className="w-full h-full object-contain" />

                    {st === 'detecting' && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#0d484b] animate-spin" />
                        <span className="text-xs font-bold text-[#0d484b]">Detecting Pose…</span>
                      </div>
                    )}

                    {st === 'detected' && (
                      <div className="absolute top-3 right-3 p-1 rounded-full bg-emerald-500 text-white shadow">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}

                    {st === 'failed' && (
                      <div className="absolute inset-0 bg-white/90 p-4 flex flex-col items-center justify-center text-center gap-2">
                        <AlertCircle className="w-6 h-6 text-rose-500" />
                        <span className="text-xs text-rose-600 font-semibold">{err}</span>
                        <span className="text-[10px] text-[#0d484b] underline mt-1 font-bold">Click to Replace</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <UploadCloud className="w-8 h-8 text-[#0d484b]" />
                    <span className="text-xs font-extrabold text-[#1a2e30]">Select {view} photo</span>
                    <span className="text-[10px] text-[#5b7173]">JPG, PNG up to 10MB</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(view, e.target.files?.[0])}
                />
              </label>
            </div>
          );
        })}
      </div>

      {/* SINGLE PRIMARY CTA */}
      <button
        onClick={handleExtract}
        disabled={!canExtract || isSubmitting}
        className="wellness-pill-primary px-8 py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Calculating Fit Contours…</span>
          </>
        ) : (
          <>
            <span>Start AI Body Fitting</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
