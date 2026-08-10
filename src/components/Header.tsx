'use client';

import React from 'react';
import { Camera, Scissors, User, Cpu, SlidersHorizontal, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scan' | 'tailor' | 'customer' | 'accuracy';
  onTabChange: (tab: 'scan' | 'tailor' | 'customer' | 'accuracy') => void;
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
    <header className="sticky top-0 z-40 w-full bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5 leading-none">
                <span className="text-cyan-400">TailorFit</span> AI
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-none mt-1">
                AI Human Body Measurement Platform
              </p>
            </div>
          </div>

          {/* Mobile Unit & Height Quick Trigger */}
          <div className="flex sm:hidden items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
              <span className="text-slate-400">Height:</span>
              <input
                type="number"
                value={userHeightCm}
                onChange={(e) => onHeightChange(Number(e.target.value) || 180)}
                className="w-10 bg-transparent text-cyan-300 font-mono font-bold text-center outline-none"
              />
              <span className="text-slate-400">cm</span>
            </div>
          </div>
        </div>

        {/* Middle: Navigation Workspace Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('scan')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'scan'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Studio</span>
          </button>

          <button
            onClick={() => onTabChange('tailor')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'tailor'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Tailor Portal</span>
          </button>

          <button
            onClick={() => onTabChange('customer')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'customer'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer Profile</span>
          </button>

          <button
            onClick={() => onTabChange('accuracy')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'accuracy'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Spec Engine</span>
          </button>
        </div>

        {/* Right: Height Scale & Unit Controls (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-medium">Height:</span>
            <input
              type="number"
              value={userHeightCm}
              onChange={(e) => onHeightChange(Number(e.target.value) || 180)}
              className="w-12 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 font-mono font-bold text-center outline-none focus:border-cyan-500"
            />
            <span className="text-slate-400 font-bold">cm</span>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => onUnitChange('cm')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                unit === 'cm' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CM
            </button>
            <button
              onClick={() => onUnitChange('inches')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                unit === 'inches' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
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
