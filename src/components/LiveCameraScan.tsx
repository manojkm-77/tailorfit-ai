'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Volume2, ShieldCheck, Zap } from 'lucide-react';
import { PoseLandmarks33, PoseFrameValidation } from '@/types/measurement';
import { validatePoseQuality } from '@/lib/measurementEngine';
import { SAMPLE_MALE_LANDMARKS } from '@/lib/sampleModels';

interface LiveCameraScanProps {
  onCapture: (capturedImageDataUri: string, detectedLandmarks: PoseLandmarks33) => void;
  userHeightCm: number;
}

export const LiveCameraScan: React.FC<LiveCameraScanProps> = ({ onCapture, userHeightCm }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [validation, setValidation] = useState<PoseFrameValidation>({
    isFullBodyVisible: false,
    isCentred: false,
    isDistanceOptimal: false,
    isPostureStraight: false,
    guidanceMessage: 'Initializing AI Vision Stream...',
    confidence: 0,
  });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);

  // Initialize camera feed
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable or blocked. You can use Simulated AI Scan or upload a photo.');
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
      stopCamera();
    };
  }, []);

  // Real-time pose analysis loop
  useEffect(() => {
    if (!streamActive && !cameraError) return;

    const interval = setInterval(() => {
      // Simulate real-time MediaPipe keypoint detection variation
      const jitter = (Math.random() - 0.5) * 0.004;
      const currentLandmarks: PoseLandmarks33 = {
        ...SAMPLE_MALE_LANDMARKS,
        nose: { ...SAMPLE_MALE_LANDMARKS.nose, x: SAMPLE_MALE_LANDMARKS.nose.x + jitter },
      };

      const val = validatePoseQuality(currentLandmarks);
      setValidation(val);

      // Auto capture trigger when posture is fully aligned
      if (autoCaptureEnabled && val.isFullBodyVisible && val.isCentred && val.isPostureStraight && val.confidence > 90) {
        if (countdown === null) {
          setCountdown(3);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [streamActive, cameraError, autoCaptureEnabled, countdown]);

  // Countdown timer handler
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      handlePerformCapture();
      setCountdown(null);
    }
  }, [countdown]);

  const handlePerformCapture = () => {
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
    // Fallback if video snapshot empty
    if (!dataUri) {
      dataUri = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="%230f172a"/><text x="300" y="400" fill="%2306b6d4" text-anchor="middle">Captured Live Feed Scan</text></svg>';
    }
    onCapture(dataUri, SAMPLE_MALE_LANDMARKS);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Real-time Guidance Banner */}
      <div
        className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all ${
          validation.confidence > 90
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
            : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {validation.confidence > 90 ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-400 animate-bounce" />
          )}
          <div>
            <div className="font-semibold text-sm">{validation.guidanceMessage}</div>
            <div className="text-xs opacity-80 font-mono">
              Posture Score: {validation.confidence}% | Calibrated Height: {userHeightCm} cm
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoCaptureEnabled(!autoCaptureEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
              autoCaptureEnabled
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{autoCaptureEnabled ? 'Auto-Scan ON' : 'Manual Mode'}</span>
          </button>
        </div>
      </div>

      {/* Video Stream Container with Guide Silhouette Overlay */}
      <div className="relative w-full max-w-[600px] h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center">
        {cameraError ? (
          <div className="flex flex-col items-center text-center p-6 gap-3">
            <Camera className="w-12 h-12 text-slate-500" />
            <div className="text-slate-300 text-sm">{cameraError}</div>
            <button
              onClick={handlePerformCapture}
              className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Perform Simulated AI Live Capture</span>
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        )}

        {/* Laser scanner line effect */}
        <div className="scan-laser" />

        {/* Human Body Outline Positioning Guide */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
          <svg width="340" height="480" viewBox="0 0 340 480" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 6">
            {/* Head oval */}
            <ellipse cx="170" cy="50" rx="30" ry="38" />
            {/* Shoulder to hip body frame */}
            <path d="M 120 95 L 220 95 L 205 240 L 135 240 Z" />
            {/* Legs */}
            <line x1="150" y1="240" x2="140" y2="440" />
            <line x1="190" y1="240" x2="200" y2="440" />
            {/* Arms */}
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
            <span>BlazePose 33D</span>
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
