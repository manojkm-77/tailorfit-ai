'use client';

import React from 'react';
import { Camera, History, FileText, User, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { BodyMeasurementItem } from '@/types/measurement';
import { MobileTab } from './BottomNav';

interface MobileHomeViewProps {
  onTabChange: (tab: MobileTab) => void;
  measurements: BodyMeasurementItem[];
  unit: 'cm' | 'inches';
  userHeightCm: number;
}

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  onTabChange,
  measurements,
  unit,
  userHeightCm,
}) => {
  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto sm:max-w-xl pb-20 sm:pb-0">
      {/* 1. Welcoming Hero Banner (Apple Health / Headspace Style) */}
      <div className="wellness-card-pink p-6 flex flex-col gap-4 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <span className="text-xs font-extrabold text-[#1a2e30] uppercase tracking-wider">Daily Fit Status</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-white/80 border border-[#e88ab4]/30 text-[11px] font-bold text-[#1a2e30]">
            Scale: {userHeightCm} cm
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black text-[#1a2e30] tracking-tight leading-tight">
            TailorFit AI v2.4
          </h1>
          <p className="text-xs text-[#5b7173] font-medium mt-1">
            Precision 3D body fitting engine calibrated for custom tailoring.
          </p>
        </div>

        {/* Single Primary Action Button */}
        <button
          onClick={() => onTabChange('scan')}
          className="wellness-pill-primary px-6 py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 transition-all hover:bg-[#093537] active:scale-95 shadow-md mt-1"
        >
          <Camera className="w-4 h-4" />
          <span>Start Guided Multi-View Scan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Last Scan Fit Health Summary */}
      <div className="wellness-card p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1a2e30]/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#dcf2eb] text-[#0d484b] flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1a2e30]">Latest Body Profile</h3>
              <p className="text-[11px] text-[#5b7173]">Calibrated for Marcus Vance</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#dcf2eb] text-[11px] font-extrabold text-[#0d484b]">
            98.4% Quality Score
          </span>
        </div>

        {/* Key Metrics Preview Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
          {measurements.slice(0, 3).map((m) => {
            const val = unit === 'cm' ? `${m.valueCm} cm` : `${m.valueInches}"`;
            return (
              <div key={m.id} className="p-3 rounded-2xl bg-[#ebf3f2] flex flex-col gap-0.5">
                <span className="text-[10px] text-[#5b7173] font-sans font-bold uppercase">{m.name.split(' ')[0]}</span>
                <span className="text-base font-black text-[#1a2e30]">{val}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Navigation Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        <div
          onClick={() => onTabChange('history')}
          className="wellness-card-green p-5 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all min-h-[120px]"
        >
          <div className="w-8 h-8 rounded-2xl bg-white flex items-center justify-center text-[#0d484b] shadow-sm">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-[#1a2e30]">Fit History</h3>
            <p className="text-[10px] text-[#5b7173] font-medium mt-0.5">Variance trends</p>
          </div>
        </div>

        <div
          onClick={() => onTabChange('reports')}
          className="wellness-card-lavender p-5 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all min-h-[120px]"
        >
          <div className="w-8 h-8 rounded-2xl bg-white flex items-center justify-center text-[#8b5cf6] shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-[#1a2e30]">Tech Pack PDF</h3>
            <p className="text-[10px] text-[#5b7173] font-medium mt-0.5">Garment cut sheet</p>
          </div>
        </div>
      </div>
    </div>
  );
};
