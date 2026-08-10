'use client';

import React from 'react';
import { Cpu, Zap, Layers, Ruler } from 'lucide-react';

export const AccuracyEngineInfo: React.FC = () => {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-300 text-xs">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-base">
            AI Computer Vision &amp; Accuracy Engine Architecture (Phase 13)
          </h3>
          <p className="text-slate-400">
            How TailorFit AI converts 2D/3D camera pixels into precise tailoring circumferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
            <Zap className="w-4 h-4" />
            <span>1. MediaPipe BlazePose GHUM</span>
          </div>
          <p className="text-slate-400">
            Extracts 33 high-frequency 3D skeletal landmarks at 60 FPS directly in the client browser canvas. Validates standing posture straightness and knee/hip alignment.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Ruler className="w-4 h-4" />
            <span>2. Ramanujan Ellipse Girth Model</span>
          </div>
          <p className="text-slate-400">
            Fuses Front view width and Side view depth using Ramanujans perimeter formula for Chest, Waist, and Hip circumferences.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
            <Layers className="w-4 h-4" />
            <span>3. Garment Margin Compensation</span>
          </div>
          <p className="text-slate-400">
            Identifies normal fitted clothes (t-shirts, jeans) and applies intelligent body-mask boundary subtraction to measure true skin-level anatomical dimensions.
          </p>
        </div>
      </div>
    </div>
  );
};
