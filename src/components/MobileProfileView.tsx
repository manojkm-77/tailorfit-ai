'use client';

import React from 'react';
import { User, SlidersHorizontal, ShieldCheck, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';
import { MobileTab } from './BottomNav';

interface MobileProfileViewProps {
  userHeightCm: number;
  onHeightChange: (h: number) => void;
  gender: 'male' | 'female';
  onGenderChange: (g: 'male' | 'female') => void;
  unit: 'cm' | 'inches';
  onUnitChange: (u: 'cm' | 'inches') => void;
}

export const MobileProfileView: React.FC<MobileProfileViewProps> = ({
  userHeightCm,
  onHeightChange,
  gender,
  onGenderChange,
  unit,
  onUnitChange,
}) => {
  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto sm:max-w-xl pb-20 sm:pb-0">
      {/* Header Banner */}
      <div className="wellness-card-pink p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#e88ab4]" />
          <h2 className="text-xl font-extrabold text-[#1a2e30]">Profile &amp; Fitting Calibration</h2>
        </div>
        <p className="text-xs text-[#5b7173]">
          Calibrate physical body parameters and tailoring measurement preferences.
        </p>
      </div>

      {/* Calibration Controls Card */}
      <div className="wellness-card p-6 flex flex-col gap-5 shadow-sm">
        {/* Height Scale Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#1a2e30]">Standing Height Calibration</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={userHeightCm}
              onChange={(e) => onHeightChange(Number(e.target.value) || 180)}
              className="w-28 px-4 py-2.5 rounded-2xl bg-[#ebf3f2] border border-[#1a2e30]/10 text-xl font-mono font-black text-[#1a2e30] text-center outline-none"
            />
            <span className="text-xs font-bold text-[#5b7173]">Centimeters (cm)</span>
          </div>
        </div>

        {/* Gender Fitting Profile */}
        <div className="flex flex-col gap-2 pt-3 border-t border-[#1a2e30]/10">
          <label className="text-xs font-bold text-[#1a2e30]">Fitting Model Ratio</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onGenderChange('male')}
              className={`py-2.5 rounded-2xl font-extrabold text-xs transition-all ${
                gender === 'male' ? 'bg-[#0d484b] text-white shadow' : 'bg-[#ebf3f2] text-[#5b7173]'
              }`}
            >
              Male Fitting
            </button>
            <button
              onClick={() => onGenderChange('female')}
              className={`py-2.5 rounded-2xl font-extrabold text-xs transition-all ${
                gender === 'female' ? 'bg-[#0d484b] text-white shadow' : 'bg-[#ebf3f2] text-[#5b7173]'
              }`}
            >
              Female Fitting
            </button>
          </div>
        </div>

        {/* Unit Preference Switcher */}
        <div className="flex flex-col gap-2 pt-3 border-t border-[#1a2e30]/10">
          <label className="text-xs font-bold text-[#1a2e30]">Measurement Unit</label>
          <div className="grid grid-cols-2 gap-2 font-mono">
            <button
              onClick={() => onUnitChange('cm')}
              className={`py-2.5 rounded-2xl font-extrabold text-xs transition-all ${
                unit === 'cm' ? 'bg-[#0d484b] text-white shadow' : 'bg-[#ebf3f2] text-[#5b7173]'
              }`}
            >
              Centimeters (CM)
            </button>
            <button
              onClick={() => onUnitChange('inches')}
              className={`py-2.5 rounded-2xl font-extrabold text-xs transition-all ${
                unit === 'inches' ? 'bg-[#0d484b] text-white shadow' : 'bg-[#ebf3f2] text-[#5b7173]'
              }`}
            >
              Inches (IN)
            </button>
          </div>
        </div>
      </div>

      {/* Backend & GPU Worker Status */}
      <div className="wellness-card p-5 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#0d484b]" />
          <span className="font-bold text-xs text-[#1a2e30]">API &amp; System Connection Status</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ebf3f2]/60">
            <span className="text-[#5b7173]">MediaPipe Vision Web Worker</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Local WASM Ready
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ebf3f2]/60">
            <span className="text-[#5b7173]">FastAPI GPU Microservices</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ebf3f2]/60">
            <span className="text-[#5b7173]">Supabase PostgreSQL &amp; RLS</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
