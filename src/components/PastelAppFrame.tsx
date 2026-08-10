'use client';

import React from 'react';
import { Sparkles, Search, SlidersHorizontal, ArrowUpRight, Home, Grid, Camera, Scissors, FileText, Activity } from 'lucide-react';

interface PastelAppFrameProps {
  children: React.ReactNode;
  activeNav: 'home' | 'scan' | 'visual' | 'trends' | 'orders' | 'report';
  onNavChange: (nav: 'home' | 'scan' | 'visual' | 'trends' | 'orders' | 'report') => void;
  userHeightCm: number;
  onHeightChange: (h: number) => void;
}

export const PastelAppFrame: React.FC<PastelAppFrameProps> = ({
  children,
  activeNav,
  onNavChange,
  userHeightCm,
  onHeightChange,
}) => {
  return (
    <div className="min-h-screen w-screen bg-[#ebdcd3] text-[#1c1c1e] flex justify-center items-center p-0 sm:p-4 overflow-x-hidden">
      {/* Centered Mobile Phone Container matching the reference UI mockup */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[880px] sm:max-h-[920px] bg-[#f4eae3] sm:rounded-[44px] sm:border-[8px] sm:border-[#ffffff] shadow-2xl flex flex-col justify-between overflow-hidden relative border-box">

        {/* Top Status Bar */}
        <div className="pt-3 px-6 pb-1 flex items-center justify-between text-xs text-[#7c7c82] font-semibold select-none z-30 shrink-0">
          <span className="font-mono text-[#1c1c1e] font-bold text-sm">19:41</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#1c1c1e]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Top Navigation Header matching reference image (Diamond icon + Search/Filter) */}
        <div className="px-5 py-3 flex items-center justify-between z-30 shrink-0">
          {/* Diamond Icon Logo (❖) */}
          <div
            onClick={() => onNavChange('home')}
            className="w-10 h-10 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-[#1c1c1e] shadow-sm cursor-pointer active:scale-95 transition-all"
          >
            <div className="grid grid-cols-2 gap-1 w-4 h-4">
              <div className="bg-[#1c1c1e] rounded-xs" />
              <div className="bg-[#1c1c1e] rounded-xs" />
              <div className="bg-[#1c1c1e] rounded-xs" />
              <div className="bg-[#1c1c1e] rounded-xs" />
            </div>
          </div>

          {/* Center Title Badge */}
          <div className="text-center">
            <span className="text-xs font-bold text-[#1c1c1e] tracking-tight uppercase font-mono">TailorFit AI</span>
          </div>

          {/* Right Action Circle (Search / Scale Input) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-black/5 px-2.5 py-1 rounded-full text-[10px] shadow-sm">
              <span className="text-[#7c7c82] font-medium">Scale:</span>
              <input
                type="number"
                value={userHeightCm}
                onChange={(e) => onHeightChange(Number(e.target.value) || 180)}
                className="w-7 bg-transparent text-center font-mono font-bold text-[#1c1c1e] outline-none"
              />
              <span className="text-[#1c1c1e] font-bold">cm</span>
            </div>

            <button
              onClick={() => onNavChange('visual')}
              className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-[#1c1c1e] shadow-sm hover:bg-[#fcf8f5] active:scale-95 transition-all"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Body Area */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4 no-scrollbar">
          {children}
        </div>

        {/* Floating Matte Black Dock Navigation Bar matching reference image bottom */}
        <div className="px-6 pb-4 pt-1 z-30 shrink-0 flex justify-center">
          <div className="pastel-dock px-4 py-2 flex items-center gap-3 shadow-2xl">
            <button
              onClick={() => onNavChange('home')}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'home' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
              title="Home Specs"
            >
              <Home className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavChange('scan')}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'scan' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
              title="Scan Camera"
            >
              <Camera className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavChange('trends')}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'trends' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
              title="Fit Dial & Trends"
            >
              <Activity className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavChange('orders')}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'orders' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
              title="Tailor Orders"
            >
              <Scissors className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavChange('report')}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'report' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
              title="Printable Tech Pack Report"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Mobile Home Bar indicator */}
        <div className="pb-1 flex justify-center shrink-0">
          <div className="w-28 h-1 rounded-full bg-[#1c1c1e]/20" />
        </div>
      </div>
    </div>
  );
};
