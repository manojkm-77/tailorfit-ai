'use client';

import React, { useEffect, useState } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, User, Sparkles, AlertCircle, ArrowRight, Cpu, Loader2, XCircle } from 'lucide-react';
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
}

type ViewKey = 'front' | 'side' | 'back';
type EngineState = 'loading' | 'ready' | 'unavailable';
type ViewDetectState = 'idle' | 'detecting' | 'detected' | 'failed';

const VIEW_LABELS: Record<ViewKey, { title: string; hint: string }> = {
  front: { title: 'Front Photo (Required)', hint: 'Primary Angle' },
  side: { title: 'Side Photo (Optional)', hint: '+4% Accuracy' },
  back: { title: 'Back Photo (Optional)', hint: 'Posture Refinement' },
};

export const PhotoUploadScan: React.FC<PhotoUploadScanProps> = ({ onProcessImages }) => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [images, setImages] = useState<Record<ViewKey, string | null>>({ front: null, side: null, back: null });
  const [landmarks, setLandmarks] = useState<Record<ViewKey, PoseLandmarks33 | null>>({ front: null, side: null, back: null });
  const [detectStates, setDetectStates] = useState<Record<ViewKey, ViewDetectState>>({ front: 'idle', side: 'idle', back: 'idle' });
  const [engineState, setEngineState] = useState<EngineState>('loading');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    initPoseDetector()
      .then((ready) => {
        if (!cancelled) setEngineState(ready ? 'ready' : 'unavailable');
      })
      .catch(() => {
        if (!cancelled) setEngineState('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, view: ViewKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const result = evt.target?.result as string;
      setImages((prev) => ({ ...prev, [view]: result }));
      setDetectStates((prev) => ({ ...prev, [view]: 'detecting' }));

      try {
        const { landmarks: detected, confidence } = await detectPoseFromImage(result);
        setLandmarks((prev) => ({ ...prev, [view]: detected }));
        setDetectStates((prev) => ({
          ...prev,
          [view]: detected && confidence >= 0.4 ? 'detected' : 'failed',
        }));
        if (!detected || confidence < 0.4) {
          setErrorMessage(
            `No reliable pose found in the ${view} photo (confidence ${Math.round(confidence * 100)}%). Ensure the full body is visible and well lit.`
          );
        }
      } catch (err) {
        console.warn(`[TailorFit] Pose detection failed for ${view} view:`, err);
        setLandmarks((prev) => ({ ...prev, [view]: null }));
        setDetectStates((prev) => ({ ...prev, [view]: 'failed' }));
        setErrorMessage(`AI pose detection failed for the ${view} photo. Please retry.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = () => {
    setErrorMessage(null);
    if (!images.front) {
      setErrorMessage('Upload a front photo before extracting measurements.');
      return;
    }
    if (engineState !== 'ready') {
      setErrorMessage('AI vision engine is not ready yet. Please wait for the model to load.');
      return;
    }
    const frontLandmarks = landmarks.front;
    if (!frontLandmarks) {
      setErrorMessage('No pose detected on the front photo — upload a clear, full-body photo and try again.');
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onProcessImages(images.front!, images.side, images.back, frontLandmarks, landmarks.side, landmarks.back, selectedGender);
    }, 700);
  };

  const engineLabel =
    engineState === 'loading'
      ? 'Loading AI Vision Engine…'
      : engineState === 'ready'
      ? 'AI Vision Engine Online'
      : 'AI Vision Engine Unavailable';

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto">
      {/* Engine Status + Gender Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
            <Cpu className={`w-4 h-4 ${engineState === 'ready' ? 'text-emerald-400' : 'text-slate-500'}`} />
            MediaPipe Pose Vision
          </h3>
          <p className="text-xs text-slate-400">
            {engineLabel} — photos are processed entirely in-browser via a Web Worker.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all capitalize ${
                selectedGender === g
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{g}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Angle Photo Upload Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['front', 'side', 'back'] as const).map((view) => {
          const image = images[view];
          const state = detectStates[view];
          return (
            <div key={view} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>{VIEW_LABELS[view].title}</span>
                <span className="text-slate-500 font-semibold">{VIEW_LABELS[view].hint}</span>
              </div>

              <label className="relative flex flex-col items-center justify-center h-52 sm:h-60 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-slate-900/60 hover:bg-slate-900 cursor-pointer overflow-hidden group transition-all">
                {image ? (
                  <div className="relative w-full h-full">
                    <img src={image} alt={`${view} view`} className="w-full h-full object-contain p-2" />
                    {state === 'detected' && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-slate-950">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    {state === 'failed' && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-rose-500 text-slate-950">
                        <XCircle className="w-4 h-4" />
                      </div>
                    )}
                    {state === 'detected' && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-slate-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Pose Locked
                      </div>
                    )}
                    {state === 'failed' && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-slate-950/80 border border-rose-500/40 text-rose-300 font-mono text-[10px] flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Pose Not Found
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    {state === 'detecting' ? (
                      <Loader2 className="w-9 h-9 text-cyan-400 animate-spin" />
                    ) : view === 'front' ? (
                      <UploadCloud className="w-9 h-9 text-cyan-500 group-hover:scale-110 transition-transform" />
                    ) : (
                      <ImageIcon className="w-9 h-9 text-slate-500 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs text-slate-300 font-semibold">
                      {state === 'detecting' ? 'Detecting Pose…' : `Upload ${view === 'front' ? 'Front' : view === 'side' ? 'Side' : 'Back'} Photo`}
                    </span>
                    {view === 'front' && (
                      <span className="text-[10px] text-slate-500">Runs real MediaPipe pose detection</span>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, view)}
                />
              </label>
            </div>
          );
        })}
      </div>

      {/* Photo Guidelines + Error Feedback */}
      {errorMessage ? (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Photo Requirements:</span> Stand straight wearing normal fitted clothes (t-shirt, jeans, activewear). Ensure good lighting and full height visibility from head to heels. AI automatically subtracts loose clothing margins.
          </div>
        </div>
      )}

      {/* Execute Analysis Action Button */}
      <div className="flex justify-center mt-1">
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing || engineState !== 'ready' || !images.front}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-cyan-500/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running Deep Pose Landmark Extraction...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Extract AI Tailoring Measurements</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
