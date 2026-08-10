'use client';

import React from 'react';
import { Camera, Layers, Scissors, Activity, FileText, Wifi, Signal, Battery, ChevronLeft, MoreHorizontal, SlidersHorizontal } from 'lucide-react';

interface MobileAppFrameProps {
  children: React.ReactNode;
  activeNav: 'scan' | 'visual' | 'orders' | 'trends' | 'report';
  onNavChange: (nav: 'scan' | 'visual' | 'orders' | 'trends' | 'report') => void;
  title?: string;
  subtitle?: string;
  userAvatarName?: string;
  userAvatarRole?: string;
  userHeightCm?: number;
  onHeightChange?: (h: number) => void;
}

export const MobileAppFrame: React.FC<MobileAppFrameProps> = ({
  children,
  activeNav,
  onNavChange,
  title = 'TailorFit AI',
  subtitle = 'Digital Body Specs',
  userAvatarName = 'Marcus Vance',
  userAvatarRole = 'Client (180cm)',
  userHeightCm = 180,
  onHeightChange,
}) => {
  return (
    <div className="h-screen w-screen bg-[#050505] text-[#f4f4f5] flex justify-center items-center p-0 sm:p-4 overflow-hidden">
      {/* Centered Mobile Phone Frame matching reference UI mockup */}
      <div className="w-full max-w-[430px] h-full sm:h-[92vh] sm:max-h-[920px] bg-[#000000] sm:rounded-[48px] sm:border-[8px] sm:border-[#1c1c1e] shadow-2xl flex flex-col justify-between overflow-hidden relative border-box">

        {/* 1. Mobile Status Bar (19:41, WiFi, Signal, Battery) */}
        <div className="pt-3 px-6 pb-1.5 flex items-center justify-between text-xs text-[#a1a1aa] font-semibold select-none bg-[#000000] z-30 shrink-0">
          <span className="font-mono text-white text-sm">19:41</span>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-white" />
            <Wifi className="w-3.5 h-3.5 text-white" />
            <Battery className="w-4 h-4 fill-white stroke-none text-white" />
          </div>
        </div>

        {/* 2. Top App Header matching reference UI mockup */}
        <div className="px-4 py-2.5 flex items-center justify-between bg-[#000000] z-30 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavChange('scan')}
              className="w-8 h-8 rounded-full bg-[#1c1c1e] border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">{title}</h1>
              <p className="text-[10px] text-[#a1a1aa] font-medium leading-none mt-1">{subtitle}</p>
            </div>
          </div>

          {/* User Profile / Calibration Quick Input */}
          <div className="flex items-center gap-2">
            {onHeightChange && (
              <div className="flex items-center gap-1 bg-[#141417] border border-white/10 px-2 py-1 rounded-full text-[10px]">
                <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                <input
                  type="number"
                  value={userHeightCm}
                  onChange={(e) => onHeightChange(Number(e.target.value) || 180)}
                  className="w-8 bg-transparent text-center text-white font-mono font-bold outline-none"
                />
                <span className="text-[#8e8e93]">cm</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-[#141417] border border-white/10 px-2 py-1 rounded-full">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-[9px] font-bold text-black">
                {userAvatarName.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-[10px] font-bold text-white hidden xs:inline">{userAvatarName}</span>
            </div>
          </div>
        </div>

        {/* 3. Scrollable App Content Area */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 no-scrollbar">
          {children}
        </div>

        {/* 4. Bottom App Navigation Bar (Fixed at bottom of mobile frame) */}
        <div className="bg-[#0c0c0e] border-t border-white/10 px-3 py-2 flex items-center justify-around z-30 shrink-0">
          <button
            onClick={() => onNavChange('scan')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
              activeNav === 'scan' ? 'text-white' : 'text-[#71717a]'
            }`}
          >
            <div className={`p-2 rounded-2xl ${activeNav === 'scan' ? 'bg-[#27272a] text-white shadow-md' : ''}`}>
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold">Scan</span>
          </button>

          <button
            onClick={() => onNavChange('visual')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
              activeNav === 'visual' ? 'text-white' : 'text-[#71717a]'
            }`}
          >
            <div className={`p-2 rounded-2xl ${activeNav === 'visual' ? 'bg-[#27272a] text-white shadow-md' : ''}`}>
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold">Mesh</span>
          </button>

          <button
            onClick={() => onNavChange('trends')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
              activeNav === 'trends' ? 'text-white' : 'text-[#71717a]'
            }`}
          >
            <div className={`p-2 rounded-2xl ${activeNav === 'trends' ? 'bg-[#27272a] text-white shadow-md' : ''}`}>
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold">Dial &amp; Fit</span>
          </button>

          <button
            onClick={() => onNavChange('orders')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
              activeNav === 'orders' ? 'text-white' : 'text-[#71717a]'
            }`}
          >
            <div className={`p-2 rounded-2xl ${activeNav === 'orders' ? 'bg-[#27272a] text-white shadow-md' : ''}`}>
              <Scissors className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold">Orders</span>
          </button>

          <button
            onClick={() => onNavChange('report')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
              activeNav === 'report' ? 'text-white' : 'text-[#71717a]'
            }`}
          >
            <div className={`p-2 rounded-2xl ${activeNav === 'report' ? 'bg-[#27272a] text-white shadow-md' : ''}`}>
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold">Report</span>
          </button>
        </div>

        {/* Bottom Mobile Home Bar indicator */}
        <div className="py-1 bg-[#0c0c0e] flex justify-center shrink-0">
          <div className="w-28 h-1 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
};
