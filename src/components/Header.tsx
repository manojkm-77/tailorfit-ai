'use client';

import React from 'react';
import { Scissors, SlidersHorizontal, Layers, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: 'wizard' | 'orders';
  onTabChange: (tab: 'wizard' | 'orders') => void;
  userHeightCm: number;
  onHeightChange: (h: number) => void;
  unit: 'cm' | 'inches';
  onUnitChange: (u: 'cm' | 'inches') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  userHeightCm,
  onHeightChange,
  unit,
  onUnitChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#090a0f]/95 backdrop-blur-md border-b border-[#222630] px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Version Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black font-bold shadow-sm">
            <Scissors className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="font-extrabold text-base text-white tracking-tight leading-none flex items-center gap-2">
              <span>TailorFit</span>
              <span className="text-xs font-mono font-normal text-[#8b90a0]">v2.4</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Stripe / Linear Pill Style) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111318] border border-[#222630] text-xs">
          <button
            onClick={() => onTabChange('wizard')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'wizard'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#8b90a0] hover:text-white'
            }`}
          >
            Measurement Studio
          </button>

          <button
            onClick={() => onTabChange('orders')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#8b90a0] hover:text-white'
            }`}
          >
            Tailor Portal
          </button>
        </div>

        {/* Right Controls: Height Calibration & Unit Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111318] border border-[#222630] text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8b90a0]" />
            <span className="text-[#8b90a0]">Height:</span>
            <input
              type="number"
              value={userHeightCm}
              onChange={(e) => onHeightChange(Number(e.target.value) || 180)}
              className="w-12 bg-transparent text-white font-mono font-bold text-center outline-none"
            />
            <span className="text-white font-bold">cm</span>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-[#111318] border border-[#222630] text-xs font-mono">
            <button
              onClick={() => onUnitChange('cm')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                unit === 'cm' ? 'bg-white text-black' : 'text-[#8b90a0] hover:text-white'
              }`}
            >
              CM
            </button>
            <button
              onClick={() => onUnitChange('inches')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                unit === 'inches' ? 'bg-white text-black' : 'text-[#8b90a0] hover:text-white'
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
