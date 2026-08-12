'use client';

import React from 'react';
import { Scissors, Sparkles, History, User, SlidersHorizontal, Home, Camera } from 'lucide-react';

export type PageView = 'home' | 'photo_upload' | 'camera_scan' | 'processing' | 'results' | 'history' | 'tailor_dashboard';

interface HeaderProps {
  activePage: PageView;
  onNavigate: (page: PageView) => void;
  userHeightCm: number;
  onHeightChange: (h: number) => void;
  unit: 'cm' | 'inches';
  onUnitChange: (u: 'cm' | 'inches') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  userHeightCm,
  onHeightChange,
  unit,
  onUnitChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#ebf3f2]/95 backdrop-blur-md border-b border-[#1a2e30]/10 px-4 sm:px-8 py-3">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0d484b] flex items-center justify-center text-white shadow-md shadow-[#0d484b]/10">
              <Scissors className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-[#1a2e30] tracking-tight leading-none">
                TailorFit <span className="text-[#0d484b]">AI</span>
              </div>
              <p className="text-[11px] text-[#5b7173] font-medium leading-none mt-1">
                Body Measurement &amp; Fit Studio
              </p>
            </div>
          </button>

          {/* Quick Height Calibration on Mobile */}
          <div className="flex sm:hidden items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[#1a2e30]/10 text-xs font-semibold">
            <span className="text-[#5b7173]">Scale:</span>
            <input
              type="number"
              value={userHeightCm}
              onChange={(e) => onHeightChange(Number(e.target.value) || 180)}
              className="w-8 bg-transparent text-center font-bold text-[#0d484b] outline-none"
            />
            <span className="text-[#1a2e30]">cm</span>
          </div>
        </div>

        {/* Navigation Pills (Finch/Headspace Style Card Navigation) */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white border border-[#1a2e30]/10 text-xs shadow-sm overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => onNavigate('home')}
            className={`px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all ${
              activePage === 'home'
                ? 'bg-[#0d484b] text-white shadow-md'
                : 'text-[#5b7173] hover:text-[#1a2e30]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onNavigate('photo_upload')}
            className={`px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all ${
              activePage === 'photo_upload' || activePage === 'camera_scan'
                ? 'bg-[#0d484b] text-white shadow-md'
                : 'text-[#5b7173] hover:text-[#1a2e30]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all ${
              activePage === 'history'
                ? 'bg-[#0d484b] text-white shadow-md'
                : 'text-[#5b7173] hover:text-[#1a2e30]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => onNavigate('tailor_dashboard')}
            className={`px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all ${
              activePage === 'tailor_dashboard'
                ? 'bg-[#0d484b] text-white shadow-md'
                : 'text-[#5b7173] hover:text-[#1a2e30]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Tailor Orders</span>
          </button>
        </div>

        {/* Right Height Scale & Unit Controls (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1a2e30]/10 text-xs font-semibold text-[#1a2e30] shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0d484b]" />
            <span className="text-[#5b7173]">Height:</span>
            <input
              type="number"
              value={userHeightCm}
              onChange={(e) => onHeightChange(Number(e.target.value) || 180)}
              className="w-10 bg-transparent font-bold text-[#0d484b] text-center outline-none"
            />
            <span>cm</span>
          </div>

          <div className="flex items-center p-1 rounded-full bg-white border border-[#1a2e30]/10 text-xs shadow-sm font-semibold">
            <button
              onClick={() => onUnitChange('cm')}
              className={`px-3 py-1 rounded-full transition-all ${
                unit === 'cm' ? 'bg-[#0d484b] text-white shadow' : 'text-[#5b7173] hover:text-[#1a2e30]'
              }`}
            >
              CM
            </button>
            <button
              onClick={() => onUnitChange('inches')}
              className={`px-3 py-1 rounded-full transition-all ${
                unit === 'inches' ? 'bg-[#0d484b] text-white shadow' : 'text-[#5b7173] hover:text-[#1a2e30]'
              }`}
            >
              IN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
