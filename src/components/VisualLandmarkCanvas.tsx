'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PoseLandmarks33, BodyMeasurementItem } from '@/types/measurement';
import { Eye, EyeOff, Layers, Sparkles, SlidersHorizontal } from 'lucide-react';

interface VisualLandmarkCanvasProps {
  imageSrc: string | null;
  landmarks: PoseLandmarks33 | null;
  measurements: BodyMeasurementItem[];
  unit: 'cm' | 'inches';
  width?: number;
  height?: number;
}

export const VisualLandmarkCanvas: React.FC<VisualLandmarkCanvasProps> = ({
  imageSrc,
  landmarks,
  measurements,
  unit,
  width = 600,
  height = 800,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showKeypoints, setShowKeypoints] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [showMesh, setShowMesh] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas
    ctx.clearRect(0, 0, width, height);

    // If image available, draw background
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        renderOverlays(ctx);
      };
    } else {
      // Dark cyber background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      renderOverlays(ctx);
    }

    function renderOverlays(ctx: CanvasRenderingContext2D) {
      if (!landmarks) return;

      const p = (pt: { x: number; y: number }) => ({
        x: pt.x * width,
        y: pt.y * height,
      });

      // 1. Draw Anatomical Skeleton Mesh / Connections
      if (showMesh) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 2.5;

        const connections: [keyof PoseLandmarks33, keyof PoseLandmarks33][] = [
          ['leftShoulder', 'rightShoulder'],
          ['leftShoulder', 'leftElbow'],
          ['leftElbow', 'leftWrist'],
          ['rightShoulder', 'rightElbow'],
          ['rightElbow', 'rightWrist'],
          ['leftShoulder', 'leftHip'],
          ['rightShoulder', 'rightHip'],
          ['leftHip', 'rightHip'],
          ['leftHip', 'leftKnee'],
          ['leftKnee', 'leftAnkle'],
          ['rightHip', 'rightKnee'],
          ['rightKnee', 'rightAnkle'],
          ['nose', 'neck'],
          ['neck', 'chestCenter'],
          ['chestCenter', 'waistCenter'],
          ['waistCenter', 'hipCenter'],
        ];

        ctx.beginPath();
        connections.forEach(([pt1Key, pt2Key]) => {
          const pt1 = landmarks[pt1Key];
          const pt2 = landmarks[pt2Key];
          if (pt1 && pt2) {
            const p1 = p(pt1);
            const p2 = p(pt2);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        });
        ctx.stroke();
      }

      // 2. Draw Key Measurement Lines & Contour Markers
      if (showLines) {
        const drawMeasureLine = (
          p1: { x: number; y: number },
          p2: { x: number; y: number },
          label: string,
          color: string = '#10b981'
        ) => {
          const pt1 = p(p1);
          const pt2 = p(p2);

          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 4]);

          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.stroke();
          ctx.setLineDash([]); // Reset dash

          // End ticks
          const dx = pt2.x - pt1.x;
          const dy = pt2.y - pt1.y;
          const len = Math.hypot(dx, dy);
          const nx = -dy / (len || 1) * 8;
          const ny = dx / (len || 1) * 8;

          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pt1.x + nx, pt1.y + ny);
          ctx.lineTo(pt1.x - nx, pt1.y - ny);
          ctx.moveTo(pt2.x + nx, pt2.y + ny);
          ctx.lineTo(pt2.x - nx, pt2.y - ny);
          ctx.stroke();

          // Label background & text
          if (showLabels && label) {
            const midX = (pt1.x + pt2.x) / 2;
            const midY = (pt1.y + pt2.y) / 2;

            ctx.font = 'bold 12px Inter, sans-serif';
            const textMetrics = ctx.measureText(label);
            const textWidth = textMetrics.width;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(midX - textWidth / 2 - 6, midY - 14, textWidth + 12, 22, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, midX, midY - 3);
          }
        };

        // Helper to format measurement text
        const getValStr = (id: string) => {
          const item = measurements.find((m) => m.id === id);
          if (!item) return '';
          const val = unit === 'cm' ? `${item.valueCm} cm` : `${item.valueInches}"`;
          return `${item.name.split(' ')[0]}: ${val}`;
        };

        // Shoulder Width Line
        drawMeasureLine(
          landmarks.leftShoulder,
          landmarks.rightShoulder,
          getValStr('shoulder'),
          '#06b6d4'
        );

        // Chest Line
        if (landmarks.leftShoulder && landmarks.rightShoulder) {
          const cY = landmarks.chestCenter.y;
          const chestLeft = { x: landmarks.leftShoulder.x - 0.04, y: cY };
          const chestRight = { x: landmarks.rightShoulder.x + 0.04, y: cY };
          drawMeasureLine(chestLeft, chestRight, getValStr('chest'), '#ec4899');
        }

        // Waist Line
        if (landmarks.leftHip && landmarks.rightHip) {
          const wY = landmarks.waistCenter.y;
          const waistLeft = { x: landmarks.leftHip.x - 0.03, y: wY };
          const waistRight = { x: landmarks.rightHip.x + 0.03, y: wY };
          drawMeasureLine(waistLeft, waistRight, getValStr('waist'), '#3b82f6');
        }

        // Hip Line
        if (landmarks.leftHip && landmarks.rightHip) {
          const hY = landmarks.hipCenter.y;
          const hipLeft = { x: landmarks.leftHip.x - 0.05, y: hY };
          const hipRight = { x: landmarks.rightHip.x + 0.05, y: hY };
          drawMeasureLine(hipLeft, hipRight, getValStr('hip'), '#8b5cf6');
        }

        // Inseam Line (Hip Center to Left Ankle)
        drawMeasureLine(
          landmarks.hipCenter,
          landmarks.leftAnkle,
          getValStr('inseam'),
          '#10b981'
        );

        // Sleeve Line (Right Shoulder to Right Wrist)
        drawMeasureLine(
          landmarks.rightShoulder,
          landmarks.rightWrist,
          getValStr('arm_length'),
          '#f59e0b'
        );
      }

      // 3. Draw 33 Keypoint Landmark Nodes
      if (showKeypoints) {
        Object.entries(landmarks).forEach(([key, pt]) => {
          if (!pt || typeof pt.x !== 'number') return;
          const nodePos = p(pt);

          // Outer glowing aura
          ctx.beginPath();
          ctx.arc(nodePos.x, nodePos.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(nodePos.x, nodePos.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#06b6d4';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }
  }, [imageSrc, landmarks, measurements, unit, width, height, showKeypoints, showLines, showMesh, showLabels]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Visual Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full max-w-[600px] p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 font-medium text-cyan-400">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Visual Overlay Controls</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMesh(!showMesh)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              showMesh ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Skeleton Mesh</span>
          </button>

          <button
            onClick={() => setShowKeypoints(!showKeypoints)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              showKeypoints ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {showKeypoints ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Landmarks</span>
          </button>

          <button
            onClick={() => setShowLines(!showLines)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              showLines ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Measure Lines</span>
          </button>
        </div>
      </div>

      {/* Canvas Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="max-w-full h-auto block"
        />

        {/* Floating AI Confidence Badge */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur border border-cyan-500/40 text-cyan-400 font-mono text-xs flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>AI Pose Lock: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
