'use client';

import React from 'react';
import { PoseLandmarks33, BodyMeasurementItem } from '@/types/measurement';
import { MALE_MODEL_SVG, FEMALE_MODEL_SVG } from '@/lib/sampleModels';
import { User, Sparkles, Plus, Search, CheckCircle2, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface ModelHeroCardProps {
  gender: 'male' | 'female' | 'unisex';
  onSelectGender: (g: 'male' | 'female') => void;
  measurements: BodyMeasurementItem[];
  unit: 'cm' | 'inches';
  scannedImage: string | null;
  userHeightCm: number;
}

export const ModelHeroCard: React.FC<ModelHeroCardProps> = ({
  gender,
  onSelectGender,
  measurements,
  unit,
  scannedImage,
  userHeightCm,
}) => {
  const displayImage = scannedImage || (gender === 'female' ? FEMALE_MODEL_SVG : MALE_MODEL_SVG);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Weather / Quick Action Bar matching left phone UI top bar */}
      <div className="flex items-center justify-between text-xs text-[#a1a1aa] px-1">
        <div>
          <div className="text-[11px] font-semibold">Wednesday, 10 Aug</div>
          <div className="flex items-center gap-1 text-white font-bold text-xs mt-0.5">
            <span>☀️ 28°C Studio</span>
          </div>
        </div>

        <button className="px-3.5 py-1.5 rounded-full bg-[#18181d] border border-white/10 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-[#27272a] transition-all">
          <Plus className="w-3.5 h-3.5" />
          <span>New Client</span>
        </button>
      </div>

      {/* 2. Welcome Title matching left phone screen */}
      <div className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
            Welcome to TailorFit
          </h2>
          <p className="text-xs text-[#8e8e93] font-medium mt-0.5">AI Body Scan & Girth Measurement</p>
        </div>

        <div className="w-9 h-9 rounded-full bg-[#18181d] border border-white/10 flex items-center justify-center text-white">
          <Search className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Hero Model Portrait Box matching left screen mockup */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#121215] shadow-2xl flex flex-col justify-end min-h-[380px]">
        {/* Background Model Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={displayImage}
            alt="Model Silhouette"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/40 to-transparent" />
        </div>

        {/* Floating Top Fitting Preset Selector Pills */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectGender('male')}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                gender === 'male'
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-black/60 backdrop-blur text-white border-white/20'
              }`}
            >
              Male Model
            </button>

            <button
              onClick={() => onSelectGender('female')}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                gender === 'female'
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-black/60 backdrop-blur text-white border-white/20'
              }`}
            >
              Female Model
            </button>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/20 text-[10px] font-mono font-bold text-emerald-400">
            98.4% Lock
          </div>
        </div>

        {/* 4. Bottom Card Overlay on Image matching reference UI */}
        <div className="relative z-10 p-4 m-3 rounded-2xl bg-[#141417]/95 backdrop-blur-md border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-white leading-tight">Marcus Vance</div>
              <div className="text-xs text-[#8e8e93] font-medium">Bespoke Fit ({userHeightCm}cm)</div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#27272a] flex items-center justify-center text-white">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Stats Bar (456 Days / 11 Projects style from image) */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#1c1c21] border border-white/5 font-mono text-center">
            <div>
              <div className="text-xl font-black text-white">98.4%</div>
              <div className="text-[9px] text-[#8e8e93] uppercase font-sans">Pose Accuracy</div>
            </div>
            <div>
              <div className="text-xl font-black text-white">20</div>
              <div className="text-[9px] text-[#8e8e93] uppercase font-sans">Garment Metrics</div>
            </div>
          </div>

          {/* Floating Horizontal Pill Tags matching bottom of left screen UI */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {measurements.slice(0, 5).map((m) => {
              const val = unit === 'cm' ? `${m.valueCm}cm` : `${m.valueInches}"`;
              return (
                <div
                  key={m.id}
                  className="px-2.5 py-1 rounded-full bg-[#27272a] border border-white/10 text-[10px] font-semibold text-white whitespace-nowrap"
                >
                  {m.name.split(' ')[0]}: {val}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
