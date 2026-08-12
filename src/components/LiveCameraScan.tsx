'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import { PoseLandmarks33 } from '@/types/measurement';
import { detectPoseFromVideoFrame, initPoseDetector } from '@/lib/mediapipeClient';

interface LiveCameraScanProps {
  userHeightCm: number;
  onCapture: (imageUri: string, landmarks: PoseLandmarks33) => void;
  onSwitchToPhoto: () => void;
}

export const LiveCameraScan: React.FC<LiveCameraScanProps> = ({
  userHeightCm,
  onCapture,
  onSwitchToPhoto,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<PoseLandmarks33 | null>(null);
  const [postureValid, setPostureValid] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    let animId: number;

    const startCamera = async () => {
      try {
        await initPoseDetector();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 720 }, height: { ideal: 960 }, facingMode: 'user' },
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamActive(true);
          runDetectionLoop();
        }
      } catch (err) {
        if (active) {
          setErrorMessage('Webcam access unavailable or permission denied.');
        }
      }
    };

    const runDetectionLoop = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
      try {
        const res = await detectPoseFromVideoFrame(videoRef.current);
        if (active) {
          setLandmarks(res.landmarks);
          const valid = Boolean(res.landmarks && res.confidence > 0.45);
          setPostureValid(valid);
        }
      } catch (err) {
        // ignore video frame error
      }
      if (active) animId = requestAnimationFrame(runDetectionLoop);
    };

    startCamera();

    return () => {
      active = false;
      if (animId) cancelAnimationFrame(animId);
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleManualCapture = () => {
    if (!videoRef.current || !landmarks) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageUri = canvas.toDataURL('image/jpeg', 0.95);
    onCapture(imageUri, landmarks);
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto sm:max-w-xl">
      {/* Top Banner */}
      <div className="wellness-card-lavender p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#1a2e30]">Live Camera Scanner</h2>
          <button
            onClick={onSwitchToPhoto}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#8b5cf6] text-xs font-bold shadow-sm"
          >
            Upload Photo Instead
          </button>
        </div>
        <p className="text-xs text-[#5b7173]">Stand tall in full view for real-time AI fitting posture lock.</p>
      </div>

      {/* Video Preview Card */}
      <div className="wellness-card p-3 relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
        {errorMessage ? (
          <div className="p-6 text-center flex flex-col items-center gap-3 text-rose-600">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs font-bold">{errorMessage}</span>
            <button
              onClick={onSwitchToPhoto}
              className="px-4 py-2 rounded-full bg-[#0d484b] text-white text-xs font-bold shadow-md mt-2"
            >
              Use Photo Upload Instead
            </button>
          </div>
        ) : (
          <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {!streamActive && (
              <div className="absolute inset-0 bg-[#ebf3f2] flex flex-col items-center justify-center gap-2 text-[#0d484b]">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-bold">Initializing Camera…</span>
              </div>
            )}

            {/* Posture Validation Badge */}
            {streamActive && (
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <div
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md ${
                    postureValid ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-black'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{postureValid ? 'Posture Locked' : 'Center Body in Frame'}</span>
                </div>

                <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-white font-mono font-bold text-xs">
                  {userHeightCm} cm
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SINGLE PRIMARY CTA */}
      <button
        onClick={handleManualCapture}
        disabled={!postureValid}
        className="wellness-pill-primary px-8 py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Camera className="w-4 h-4" />
        <span>Capture Fit Pose</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
