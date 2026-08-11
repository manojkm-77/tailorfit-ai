'use client';

import React from 'react';
import { Camera, Scissors, User, Cpu, SlidersHorizontal, Activity, Layers, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scan' | 'trends' | 'visual' | 'orders' | 'accuracy';
  onTabChange: (tab: 'scan' | 'trends' | 'visual' | 'orders' | 'accuracy') => void;
  userHeightCm: number;
  onHeightChange: (h: number) => void;
  unit: 'cm' | 'inches';
  onUnitChange: (u: 'cm' | 'inches') => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  userHeightCm,
  onHeightChange,
  unit,
  onUnitChange,
  onOpenReport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080a]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#18181c] border border-white/15 flex items-center justify-center text-white shadow-lg">
              <Scissors className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="font-black text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5 leading-none">
                <span>TailorFit</span> <span className="text-cyan-400">AI</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white border border-white/15">
                  PRO v2.4
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#9ea0a6] font-medium leading-none mt-1">
                AI Human Body Measurement Platform
              </p>
            </div>
          </div>

          {/* User Profile Avatar Tag (Mobile) */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1 bg-[#18181c] border border-white/10 px-2.5 py-1 rounded-full text-[11px]">
              <span className="text-[#9ea0a6]">Scale:</span>
              <input
                type="number"
                value={userHeightCm}
                onChange={(e) => onHeightChange(Number(e.target.value) || 180)}
                className="w-8 bg-transparent text-center font-mono font-bold text-white outline-none"
              />
              <span className="text-white">cm</span>
            </div>
          </div>
        </div>

        {/* Middle: Main App Navigation Tabs matching reference mockup */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#121215] border border-white/10 text-xs w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('scan')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'scan'
                ? 'bg-white text-black shadow-lg font-extrabold'
                : 'text-[#9ea0a6] hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Studio</span>
          </button>

          <button
            onClick={() => onTabChange('trends')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'trends'
                ? 'bg-white text-black shadow-lg font-extrabold'
                : 'text-[#9ea0a6] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dial &amp; Trends</span>
          </button>

          <button
            onClick={() => onTabChange('visual')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'visual'
                ? 'bg-white text-black shadow-lg font-extrabold'
                : 'text-[#9ea0a6] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>33D Mesh</span>
          </button>

          <button
            onClick={() => onTabChange('orders')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-white text-black shadow-lg font-extrabold'
                : 'text-[#9ea0a6] hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Tailor Orders</span>
          </button>

          <button
            onClick={onOpenReport}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl font-bold text-white hover:bg-white/10 flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tech Pack Report</span>
          </button>
        </div>

        {/* Right: Height Scale & Unit Switcher (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Height Scale Input */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121215] border border-white/10 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[#9ea0a6] font-medium">Height Scale:</span>
            <input
              type="number"
              value={userHeightCm}
              onChange={(e) => onHeightChange(Number(e.target.value) || 180)}
              className="w-12 px-1 py-0.5 rounded bg-[#18181c] border border-white/10 text-white font-mono font-bold text-center outline-none focus:border-cyan-500"
            />
            <span className="text-white font-bold">cm</span>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#121215] border border-white/10 text-xs">
            <button
              onClick={() => onUnitChange('cm')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                unit === 'cm' ? 'bg-white text-black shadow' : 'text-[#9ea0a6] hover:text-white'
              }`}
            >
              CM
            </button>
            <button
              onClick={() => onUnitChange('inches')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                unit === 'inches' ? 'bg-white text-black shadow' : 'text-[#9ea0a6] hover:text-white'
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
