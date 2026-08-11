'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { PoseLandmarks33, PoseFrameValidation } from '@/types/measurement';
import { validatePoseQuality } from '@/lib/measurementEngine';
import { detectPoseFromVideoFrame, initPoseDetector } from '@/lib/mediapipeClient';

interface LiveCameraScanProps {
  onCapture: (capturedImageDataUri: string, detectedLandmarks: PoseLandmarks33) => void;
  userHeightCm: number;
}

export const LiveCameraScan: React.FC<LiveCameraScanProps> = ({ onCapture, userHeightCm }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [engineState, setEngineState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [validation, setValidation] = useState<PoseFrameValidation>({
    isFullBodyVisible: false,
    isCentred: false,
    isDistanceOptimal: false,
    isPostureStraight: false,
    guidanceMessage: 'Initializing AI Vision Stream...',
    confidence: 0,
  });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [captureReady, setCaptureReady] = useState(false);

  const streamActiveRef = useRef(streamActive);
  const cameraErrorRef = useRef(cameraError);
  const engineReadyRef = useRef(false);
  const autoCaptureRef = useRef(true);
  const lastLandmarksRef = useRef<PoseLandmarks33 | null>(null);
  const destroyedRef = useRef(false);
  const checkingRef = useRef(false);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  streamActiveRef.current = streamActive;
  cameraErrorRef.current = cameraError;

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
      }
    } catch {
      setCameraError('Camera access unavailable or blocked. Use the Photo Studio upload mode instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      destroyedRef.current = true;
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    initPoseDetector()
      .then((ready) => {
        if (cancelled) return;
        engineReadyRef.current = ready;
        setEngineState(ready ? 'ready' : 'unavailable');
      })
      .catch(() => {
        if (cancelled) return;
        engineReadyRef.current = false;
        setEngineState('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runPoseCheck = async () => {
    if (checkingRef.current || destroyedRef.current) return;
    checkingRef.current = true;

    try {
      if (!engineReadyRef.current || !streamActiveRef.current || cameraErrorRef.current) {
        if (!engineReadyRef.current && engineState === 'loading') {
          setValidation({
            isFullBodyVisible: false,
            isCentred: false,
            isDistanceOptimal: false,
            isPostureStraight: false,
            guidanceMessage: 'Loading AI vision engine…',
            confidence: 0,
          });
        }
        return;
      }

      const { landmarks: detected } = await detectPoseFromVideoFrame(videoRef.current!);
      if (detected) {
        lastLandmarksRef.current = detected;
        const val = validatePoseQuality(detected);
        setValidation(val);
        setCaptureReady(val.isFullBodyVisible && val.isCentred && val.isPostureStraight && val.confidence > 85);

        if (autoCaptureRef.current && val.isFullBodyVisible && val.isCentred && val.isPostureStraight && val.confidence > 90) {
          setCountdown((current) => (current === null ? 3 : current));
        }
      } else {
        setCaptureReady(false);
        setValidation((prev) => ({
          ...prev,
          isFullBodyVisible: false,
          isCentred: false,
          isDistanceOptimal: false,
          isPostureStraight: false,
          guidanceMessage: 'No person detected — step fully into the frame.',
          confidence: 0,
        }));
      }
    } catch (err) {
      console.warn('[TailorFit] Live pose frame detection failed:', err);
      setValidation((prev) => ({ ...prev, guidanceMessage: 'Pose detection error — retrying…', confidence: 0 }));
    } finally {
      checkingRef.current = false;
      if (!destroyedRef.current) {
        checkTimerRef.current = setTimeout(runPoseCheck, 50); // ~20 fps pose tracking; MediaPipe cadence is detection-limited
      }
    }
  };

  useEffect(() => {
    if (!streamActive && !cameraError) return;
    runPoseCheck();
    return () => {
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamActive, cameraError, engineState]);

  // Countdown timer handler
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    handlePerformCapture();
    setCountdown(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const handlePerformCapture = () => {
    const snapshotLandmarks = lastLandmarksRef.current;
    if (!snapshotLandmarks) {
      setValidation((prev) => ({ ...prev, guidanceMessage: 'Stand fully in frame so a pose can be locked before capture.', confidence: 0 }));
      return;
    }

    let dataUri = '';
    if (videoRef.current && streamActive) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 600;
      canvas.height = videoRef.current.videoHeight || 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        dataUri = canvas.toDataURL('image/jpeg');
      }
    }
    if (dataUri) {
      onCapture(dataUri, snapshotLandmarks);
    }
  };

  const guidanceTone = validation.confidence > 85;
  const engineOffline = engineState === 'unavailable';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Real-time Guidance Banner */}
      <div
        className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all ${
          guidanceTone
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
            : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {guidanceTone ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
          <div>
            <div className="font-bold text-sm text-slate-100">{validation.guidanceMessage}</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Pose Confidence: {validation.confidence}% • Live MediaPipe BlazePose
            </div>
          </div>
          {countdown !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xl font-black">
              <span className="animate-pulse">Auto-Capture in {countdown}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            autoCaptureRef.current = !autoCaptureRef.current;
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
            autoCaptureRef.current
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{autoCaptureRef.current ? 'Auto-Scan ON' : 'Manual Mode'}</span>
        </button>
      </div>

      {/* Video Stream Container with Guide Silhouette Overlay */}
      <div className="relative w-full max-w-[600px] h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center">
        {cameraError || engineOffline ? (
          <div className="flex flex-col items-center text-center p-6 gap-3">
            <Camera className="w-12 h-12 text-slate-500" />
            <div className="text-slate-300 text-sm">{cameraError || engineState === 'unavailable' ? 'AI vision engine failed to load (model/WASM fetch). Use Photo Studio upload mode instead.' : ''}</div>
            {cameraError && (
              <button
                onClick={startCamera}
                className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Camera Access</span>
              </button>
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        )}

        {engineState === 'loading' && !cameraError && (
          <div className="absolute inset-0 z-10 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-300 font-mono">Loading MediaPipe vision engine…</span>
          </div>
        )}

        <div className="scan-laser" />

        {/* Human Body Outline Positioning Guide */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
          <svg width="340" height="480" viewBox="0 0 340 480" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 6">
            <ellipse cx="170" cy="50" rx="30" ry="38" />
            <path d="M 120 95 L 220 95 L 205 240 L 135 240 Z" />
            <line x1="150" y1="240" x2="140" y2="440" />
            <line x1="190" y1="240" x2="200" y2="440" />
            <line x1="120" y1="95" x2="90" y2="260" />
            <line x1="220" y1="95" x2="250" y2="260" />
          </svg>
        </div>

        {/* Alignment Checkpoints HUD */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/80 backdrop-blur border border-slate-800 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <span className={validation.isFullBodyVisible ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
              ● Full Body
            </span>
            <span className={validation.isCentred ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
              ● Centered
            </span>
            <span className={validation.isPostureStraight ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
              ● Straight Pose
            </span>
          </div>

          <div className="flex items-center gap-1 text-cyan-400 font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>BlazePose 33D LIVE</span>
          </div>
        </div>

        {/* Auto Capture Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-cyan-950/70 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <div className="text-8xl font-black text-cyan-300 font-mono animate-bounce">{countdown}</div>
            <div className="text-cyan-100 font-semibold text-lg mt-2">Hold Still! Capturing Body Pose...</div>
          </div>
        )}
      </div>

      {/* Manual Trigger Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePerformCapture}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-xl shadow-cyan-500/25 active:scale-95"
        >
          <Camera className="w-5 h-5" />
          <span>Capture Measurement Photo Now</span>
        </button>

        {streamActive && (
          <button
            onClick={startCamera}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            title="Reset Camera Stream"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
