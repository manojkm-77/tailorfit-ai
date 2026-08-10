'use client';

import React, { useState } from 'react';
import { BodyMeasurementItem } from '@/types/measurement';
import { ArrowUpRight, Camera, Upload, CheckCircle2, ShieldCheck, Sparkles, User, SlidersHorizontal } from 'lucide-react';

interface PastelHomeHubProps {
  measurements: BodyMeasurementItem[];
  unit: 'cm' | 'inches';
  onUnitChange: (u: 'cm' | 'inches') => void;
  userHeightCm: number;
  gender: 'male' | 'female' | 'unisex';
  onSelectGender: (g: 'male' | 'female') => void;
  onNavigateToScan: () => void;
  onOpenReport: () => void;
}

export const PastelHomeHub: React.FC<PastelHomeHubProps> = ({
  measurements,
  unit,
  onUnitChange,
  userHeightCm,
  gender,
  onSelectGender,
  onNavigateToScan,
  onOpenReport,
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'reflection'>('grid');

  // Group measurements into 4 categories matching the 4 pastel cards
  const upperBody = measurements.filter((m) => m.category === 'upper_body' || m.category === 'neck');
  const torso = measurements.filter((m) => m.category === 'torso');
  const lowerBody = measurements.filter((m) => m.category === 'lower_body' || m.category === 'full_body');
  const arms = measurements.filter((m) => m.category === 'arms');

  const shoulderItem = measurements.find((m) => m.id === 'shoulder');
  const chestItem = measurements.find((m) => m.id === 'chest');
  const waistItem = measurements.find((m) => m.id === 'waist');
  const hipItem = measurements.find((m) => m.id === 'hip');
  const inseamItem = measurements.find((m) => m.id === 'inseam');
  const armItem = measurements.find((m) => m.id === 'arm_length');

  const formatVal = (item?: BodyMeasurementItem) => {
    if (!item) return '--';
    return unit === 'cm' ? `${item.valueCm} cm` : `${item.valueInches}"`;
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. Header Section matching reference image UI */}
      <div>
        <div className="text-xs text-[#7c7c82] font-semibold tracking-wide uppercase">
          Tailor Specifications
        </div>
        <h2 className="text-2xl font-extrabold text-[#1c1c1e] tracking-tight leading-tight mt-1">
          Measurements based on your <span className="font-black underline decoration-[#f1dc85] decoration-4">needs</span>
        </h2>
      </div>

      {/* Unit Toggle Pill Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center p-1 rounded-full bg-white border border-black/5 text-xs shadow-sm">
          <button
            onClick={() => onUnitChange('cm')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              unit === 'cm' ? 'bg-[#1c1c1e] text-white' : 'text-[#7c7c82] hover:text-[#1c1c1e]'
            }`}
          >
            CM
          </button>
          <button
            onClick={() => onUnitChange('inches')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              unit === 'inches' ? 'bg-[#1c1c1e] text-white' : 'text-[#7c7c82] hover:text-[#1c1c1e]'
            }`}
          >
            Inches
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#7c7c82]">
          <ShieldCheck className="w-4 h-4 text-[#748e64]" />
          <span>98.4% BlazePose Lock</span>
        </div>
      </div>

      {/* 2. Four Colorful Pastel Cards Grid matching the exact reference mockup */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* CARD 1: Soft Lavender (#c6ccf8) - Upper Body */}
        <div
          onClick={onNavigateToScan}
          className="bg-[#c6ccf8] rounded-[28px] p-4 flex flex-col justify-between min-h-[170px] shadow-sm hover:shadow-md transition-all cursor-pointer relative group"
        >
          <div>
            <div className="text-[11px] font-bold text-[#1c1c1e]/70 uppercase font-mono">Upper Body</div>
            <div className="text-sm font-black text-[#1c1c1e] mt-1 leading-snug">
              Shoulder &amp; Chest Girth
            </div>
            <div className="text-xs font-mono font-bold text-[#1c1c1e] mt-2">
              {formatVal(chestItem)}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] font-semibold text-[#1c1c1e]/60">{upperBody.length} Specs</span>
            <div className="w-8 h-8 rounded-full bg-[#1c1c1e]/10 group-hover:bg-[#1c1c1e] group-hover:text-white transition-colors flex items-center justify-center text-[#1c1c1e]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* CARD 2: Warm Ochre Yellow (#f1dc85) - Torso & Waist */}
        <div
          onClick={onNavigateToScan}
          className="bg-[#f1dc85] rounded-[28px] p-4 flex flex-col justify-between min-h-[170px] shadow-sm hover:shadow-md transition-all cursor-pointer relative group"
        >
          <div>
            <div className="text-[11px] font-bold text-[#1c1c1e]/70 uppercase font-mono">Torso &amp; Waist</div>
            <div className="text-sm font-black text-[#1c1c1e] mt-1 leading-snug">
              Waist &amp; Belly Contour
            </div>
            <div className="text-xs font-mono font-bold text-[#1c1c1e] mt-2">
              {formatVal(waistItem)}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] font-semibold text-[#1c1c1e]/60">{torso.length} Specs</span>
            <div className="w-8 h-8 rounded-full bg-[#1c1c1e]/10 group-hover:bg-[#1c1c1e] group-hover:text-white transition-colors flex items-center justify-center text-[#1c1c1e]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* CARD 3: Pastel Sage Green (#c5dfd4) - Lower Body */}
        <div
          onClick={onNavigateToScan}
          className="bg-[#c5dfd4] rounded-[28px] p-4 flex flex-col justify-between min-h-[170px] shadow-sm hover:shadow-md transition-all cursor-pointer relative group"
        >
          <div>
            <div className="text-[11px] font-bold text-[#1c1c1e]/70 uppercase font-mono">Lower Body</div>
            <div className="text-sm font-black text-[#1c1c1e] mt-1 leading-snug">
              Inseam &amp; Trouser Outseam
            </div>
            <div className="text-xs font-mono font-bold text-[#1c1c1e] mt-2">
              {formatVal(inseamItem)}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] font-semibold text-[#1c1c1e]/60">{lowerBody.length} Specs</span>
            <div className="w-8 h-8 rounded-full bg-[#1c1c1e]/10 group-hover:bg-[#1c1c1e] group-hover:text-white transition-colors flex items-center justify-center text-[#1c1c1e]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* CARD 4: Pastel Terracotta (#e7a394) - Arms & Sleeves */}
        <div
          onClick={onNavigateToScan}
          className="bg-[#e7a394] rounded-[28px] p-4 flex flex-col justify-between min-h-[170px] shadow-sm hover:shadow-md transition-all cursor-pointer relative group"
        >
          <div>
            <div className="text-[11px] font-bold text-[#1c1c1e]/70 uppercase font-mono">Arms &amp; Sleeves</div>
            <div className="text-sm font-black text-[#1c1c1e] mt-1 leading-snug">
              Sleeve Length &amp; Bicep
            </div>
            <div className="text-xs font-mono font-bold text-[#1c1c1e] mt-2">
              {formatVal(armItem)}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] font-semibold text-[#1c1c1e]/60">{arms.length} Specs</span>
            <div className="w-8 h-8 rounded-full bg-[#1c1c1e]/10 group-hover:bg-[#1c1c1e] group-hover:text-white transition-colors flex items-center justify-center text-[#1c1c1e]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Daily Reflection Card matching the middle phone screen in reference image */}
      <div className="pastel-card p-5 flex flex-col gap-4">
        <div className="text-xs text-[#7c7c82] font-semibold tracking-wide uppercase">
          Client Reflection
        </div>

        <h3 className="text-lg font-extrabold text-[#1c1c1e] tracking-tight leading-snug">
          Hello, Marcus 👤 How do you feel about your <span className="font-black underline decoration-[#c6ccf8] decoration-4">garment fit</span>?
        </h3>

        {/* Your Reflection Input Pill */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fcf8f5] border border-black/5 text-xs">
          <span className="text-[#7c7c82] font-medium">Calibrated height: {userHeightCm} cm</span>
          <div className="w-7 h-7 rounded-full bg-[#1c1c1e] text-white flex items-center justify-center">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Fitting Preset Row matching mood log row in image */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-bold text-[#1c1c1e]">Fitting Preset:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectGender('male')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                gender === 'male' ? 'bg-[#1c1c1e] text-white' : 'bg-[#fcf8f5] text-[#7c7c82]'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => onSelectGender('female')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                gender === 'female' ? 'bg-[#1c1c1e] text-white' : 'bg-[#fcf8f5] text-[#7c7c82]'
              }`}
            >
              Female
            </button>
          </div>
        </div>
      </div>

      {/* 4. Progress Card with Bubble Grid matching bottom of middle screen in reference image */}
      <div className="pastel-card p-5 flex flex-col gap-3 relative overflow-hidden">
        <div className="text-xs text-[#7c7c82] font-semibold tracking-wide uppercase">
          Scan Precision Lock
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-4xl font-black text-[#1c1c1e] tracking-tight">98.4%</span>
            <div className="text-xs text-[#7c7c82] font-medium mt-0.5">Pattern Ready for Stitching</div>
          </div>

          <button
            onClick={onOpenReport}
            className="px-4 py-2 rounded-full bg-[#1c1c1e] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-black transition-all"
          >
            <span>Tech Pack Report</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mint Green Bubble Grid Pattern matching reference image */}
        <div className="grid grid-cols-8 gap-2 pt-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full transition-all ${
                i < 20
                  ? i % 3 === 0
                    ? 'bg-[#c5dfd4]'
                    : i % 2 === 0
                    ? 'bg-[#c6ccf8]'
                    : 'bg-[#f1dc85]'
                  : 'bg-black/5'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
