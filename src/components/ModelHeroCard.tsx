'use client';

import React from 'react';
import { BodyMeasurementItem } from '@/types/measurement';
import { MALE_MODEL_SVG, FEMALE_MODEL_SVG } from '@/lib/sampleModels';
import { Plus, Search, ChevronRight, ShieldCheck } from 'lucide-react';

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
      {/* 1. Date / Weather Bar matching left phone UI */}
      <div className="flex items-center justify-between text-xs text-[#9ea0a6] px-1">
        <div>
          <div className="text-[11px] font-semibold text-[#9ea0a6]">Wednesday, 25 Sep</div>
          <div className="flex items-center gap-1.5 text-white font-bold text-xs mt-0.5">
            <span>☀️ 27°C Bespoke Atelier</span>
          </div>
        </div>

        <button className="px-3.5 py-1.5 rounded-full bg-[#18181c] border border-white/10 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-[#24242a] transition-all cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>New Client</span>
        </button>
      </div>

      {/* 2. Welcome Title matching left phone screen */}
      <div className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            Welcome to TailorFit
          </h2>
          <p className="text-xs text-[#9ea0a6] font-medium mt-0.5">20 AI Garment Specs Calibrated</p>
        </div>

        <div className="w-9 h-9 rounded-full bg-[#18181c] border border-white/10 flex items-center justify-center text-white shrink-0">
          <Search className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Hero Model Portrait Card matching left phone screen in reference image */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#121215] shadow-2xl flex flex-col justify-end min-h-[380px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={displayImage}
            alt="Model Silhouette"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent" />
        </div>

        {/* Floating Fitting Preset Buttons at Top */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectGender('male')}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                gender === 'male'
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-black/60 backdrop-blur text-white border-white/20'
              }`}
            >
              Male Model
            </button>

            <button
              onClick={() => onSelectGender('female')}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                gender === 'female'
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-black/60 backdrop-blur text-white border-white/20'
              }`}
            >
              Female Model
            </button>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur border border-white/20 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>98.4% Lock</span>
          </div>
        </div>

        {/* 4. Bottom Obsidian Card Overlay matching reference UI mockup */}
        <div className="relative z-10 p-4 m-3 rounded-2xl bg-[#141418]/95 backdrop-blur-md border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-white leading-tight">Marcus Vance</div>
              <div className="text-xs text-[#9ea0a6] font-medium">Bespoke Fitting ({userHeightCm}cm)</div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#24242a] flex items-center justify-center text-white shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Stats Bar (456 Days 100% / 11 Projects 40% style from reference image) */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#1a1a1e] border border-white/5 font-mono text-center">
            <div>
              <div className="text-lg font-black text-white">98.4%</div>
              <div className="text-[9px] text-[#9ea0a6] font-sans font-semibold uppercase">Pose Lock</div>
            </div>
            <div>
              <div className="text-lg font-black text-white">20</div>
              <div className="text-[9px] text-[#9ea0a6] font-sans font-semibold uppercase">Garment Specs</div>
            </div>
          </div>

          {/* Horizontal Scrolling Tag Pills matching bottom of left screen in reference UI */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {measurements.slice(0, 6).map((m) => {
              const val = unit === 'cm' ? `${m.valueCm}cm` : `${m.valueInches}"`;
              return (
                <div
                  key={m.id}
                  className="px-2.5 py-1 rounded-full bg-[#24242a] border border-white/10 text-[10px] font-semibold text-white whitespace-nowrap"
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
