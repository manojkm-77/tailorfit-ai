'use client';

import React, { useEffect, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { PoseLandmarks33 } from '@/types/measurement';
import { detectPoseFromImage, initPoseDetector } from '@/lib/mediapipeClient';

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
}

type ViewKey = 'front' | 'side' | 'back';
type EngineState = 'loading' | 'ready' | 'unavailable';
type ViewDetectState = 'idle' | 'detecting' | 'detected' | 'failed';

const VIEW_LABELS: Record<ViewKey, { title: string; hint: string }> = {
  front: { title: 'Front Photo (Required)', hint: 'Primary Angle' },
  side: { title: 'Side Photo (Optional)', hint: '+4% Depth Accuracy' },
  back: { title: 'Back Photo (Optional)', hint: 'Shoulder Curvature' },
};

export const PhotoUploadScan: React.FC<PhotoUploadScanProps> = ({
  onProcessImages,
  selectedGender,
  onGenderChange,
}) => {
  const [engineState, setEngineState] = useState<EngineState>('loading');
  const [images, setImages] = useState<Record<ViewKey, string | null>>({
    front: null,
    side: null,
    back: null,
  });
  const [landmarks, setLandmarks] = useState<Record<ViewKey, PoseLandmarks33 | null>>({
    front: null,
    side: null,
    back: null,
  });
  const [detectStates, setDetectStates] = useState<Record<ViewKey, ViewDetectState>>({
    front: 'idle',
    side: 'idle',
    back: 'idle',
  });
  const [errors, setErrors] = useState<Record<ViewKey, string | null>>({
    front: null,
    side: null,
    back: null,
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
        images.back,
        landmarks.front!,
        landmarks.side,
        landmarks.back,
        selectedGender
      );
    }, 400);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Fitting Profile Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#181b22] border border-[#222630]">
        <div>
          <div className="font-bold text-white text-sm">Fitting Model Profile</div>
          <div className="text-xs text-[#8b90a0]">Calibrates anatomical proportion ratios</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onGenderChange('male')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGender === 'male' ? 'bg-white text-black' : 'bg-[#111318] text-[#8b90a0] border border-[#222630]'
            }`}
          >
            Male Fitting
          </button>
          <button
            onClick={() => onGenderChange('female')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGender === 'female' ? 'bg-white text-black' : 'bg-[#111318] text-[#8b90a0] border border-[#222630]'
            }`}
          >
            Female Fitting
          </button>
        </div>
      </div>

      {/* Multi-View Photo Upload Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['front', 'side', 'back'] as ViewKey[]).map((view) => {
          const info = VIEW_LABELS[view];
          const img = images[view];
          const st = detectStates[view];
          const err = errors[view];
          const isFront = view === 'front';

          return (
            <div key={view} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span>{info.title}</span>
                <span className="text-[10px] font-mono text-[#8b90a0]">{info.hint}</span>
              </div>

              <label
                className={`relative flex flex-col items-center justify-center h-56 rounded-2xl border-2 border-dashed bg-[#181b22] cursor-pointer overflow-hidden transition-all ${
                  st === 'detected'
                    ? 'border-emerald-500/50'
                    : isFront
                    ? 'border-white/30 hover:border-white'
                    : 'border-[#222630] hover:border-white/20'
                }`}
              >
                {img ? (
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    <img src={img} alt={view} className="w-full h-full object-contain" />

                    {st === 'detecting' && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                        <span className="text-xs font-mono text-white">Extracting Pose…</span>
                      </div>
                    )}

                    {st === 'detected' && (
                      <div className="absolute top-3 right-3 p-1 rounded-full bg-emerald-500 text-black">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}

                    {st === 'failed' && (
                      <div className="absolute inset-0 bg-black/80 p-4 flex flex-col items-center justify-center text-center gap-2">
                        <AlertCircle className="w-6 h-6 text-rose-400" />
                        <span className="text-xs text-rose-300 font-semibold">{err}</span>
                        <span className="text-[10px] text-white underline mt-1">Click to Replace</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5 p-4 text-center">
                    <UploadCloud className="w-8 h-8 text-[#8b90a0]" />
                    <span className="text-xs font-bold text-white">Select {view} photo</span>
                    <span className="text-[10px] text-[#8b90a0]">JPG, PNG up to 10MB</span>
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

      {/* Guidelines Box */}
      <div className="p-3.5 rounded-xl bg-[#181b22] border border-[#222630] text-xs text-[#8b90a0] flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Photo Requirements:</strong> Stand straight wearing fitted clothes. Ensure head-to-heels full body visibility with bright lighting.
        </div>
      </div>

      {/* SINGLE PRIMARY CTA BUTTON (Linear / Stripe Style) */}
      <div className="flex justify-center mt-2">
        <button
          onClick={handleExtract}
          disabled={!canExtract || isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:bg-white/90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Calculating 3D Perimeters…</span>
            </>
          ) : (
            <>
              <span>Extract Body Measurements</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
