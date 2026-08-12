'use client';

import React from 'react';
import { Camera, History, Scissors, Sparkles, ArrowRight, ShieldCheck, Heart, User, CheckCircle2 } from 'lucide-react';
import { BodyMeasurementItem } from '@/types/measurement';
import { PageView } from './Header';

interface HomePageViewProps {
  onNavigate: (page: PageView) => void;
  measurements: BodyMeasurementItem[];
  unit: 'cm' | 'inches';
  userHeightCm: number;
}

export const HomePageView: React.FC<HomePageViewProps> = ({
  onNavigate,
  measurements,
  unit,
  userHeightCm,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto sm:max-w-2xl">
      {/* 1. Welcoming Hero Card matching reference UI top header */}
      <div className="wellness-card-pink p-6 flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <span className="text-xs font-bold text-[#1a2e30] uppercase tracking-wider">Welcome Back</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-white/80 border border-[#e88ab4]/30 text-[11px] font-bold text-[#1a2e30]">
            Scale: {userHeightCm} cm
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2e30] tracking-tight leading-tight">
            Find Your Perfect Custom Fit
          </h1>
          <p className="text-xs sm:text-sm text-[#5b7173] font-medium mt-1">
            Estimate 20 exact tailoring dimensions using AI body scanning.
          </p>
        </div>

        {/* Single Primary CTA */}
        <button
          onClick={() => onNavigate('photo_upload')}
          className="wellness-pill-primary px-6 py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 transition-all hover:bg-[#093537] active:scale-95 shadow-md mt-1"
        >
          <Camera className="w-4 h-4" />
          <span>Start AI Body Fitting Scan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Quick Action Grid (Pastel Cards matching reference image) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Photo Upload Card (Soft Mint) */}
        <div
          onClick={() => onNavigate('photo_upload')}
          className="wellness-card-green p-5 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all min-h-[140px]"
        >
          <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center text-[#0d484b] shadow-sm">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1a2e30]">Photo Upload</h3>
            <p className="text-[11px] text-[#5b7173] font-medium mt-0.5">Upload front &amp; side photos</p>
          </div>
        </div>

        {/* Live Camera Scan Card (Soft Lavender) */}
        <div
          onClick={() => onNavigate('camera_scan')}
          className="wellness-card-lavender p-5 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all min-h-[140px]"
        >
          <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center text-[#8b5cf6] shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1a2e30]">Live Camera</h3>
            <p className="text-[11px] text-[#5b7173] font-medium mt-0.5">Real-time webcam scan</p>
          </div>
        </div>
      </div>

      {/* 3. Latest Scan Summary Card */}
      <div className="wellness-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#1a2e30]/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#dcf2eb] text-[#0d484b] flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1a2e30]">Latest Fit Scan Profile</h3>
              <p className="text-[11px] text-[#5b7173]">Calibrated for Marcus Vance</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#dcf2eb] text-[11px] font-bold text-[#0d484b]">
            98.4% Accuracy
          </span>
        </div>

        {/* Key Metrics Pill Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
          {measurements.slice(0, 3).map((m) => {
            const val = unit === 'cm' ? `${m.valueCm} cm` : `${m.valueInches}"`;
            return (
              <div key={m.id} className="p-3 rounded-2xl bg-[#ebf3f2] flex flex-col gap-0.5">
                <span className="text-[10px] text-[#5b7173] font-sans font-semibold uppercase">{m.name.split(' ')[0]}</span>
                <span className="text-base font-black text-[#1a2e30]">{val}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onNavigate('results')}
          className="w-full py-2.5 rounded-2xl bg-[#ebf3f2] hover:bg-[#dcf2eb] text-[#0d484b] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <span>View All 20 Tailoring Metrics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. Bottom Cards: History & Tailor Dashboard Triggers */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('history')}
          className="wellness-card p-4 flex items-center gap-3 text-left hover:shadow-md transition-all"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#fce8f3] text-[#e88ab4] flex items-center justify-center shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-xs text-[#1a2e30]">Fit History</div>
            <div className="text-[10px] text-[#5b7173]">Track body trends</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('tailor_dashboard')}
          className="wellness-card p-4 flex items-center gap-3 text-left hover:shadow-md transition-all"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#ece7f9] text-[#8b5cf6] flex items-center justify-center shrink-0">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-xs text-[#1a2e30]">Tailor Portal</div>
            <div className="text-[10px] text-[#5b7173]">Order status</div>
          </div>
        </button>
      </div>
    </div>
  );
};
