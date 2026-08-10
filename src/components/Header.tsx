'use client';

import React from 'react';
import { Camera, Scissors, User, Cpu, Sparkles, SlidersHorizontal, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scan' | 'tailor' | 'customer' | 'accuracy';
  onTabChange: (tab: 'scan' | 'tailor' | 'customer' | 'accuracy') => void;
  userHeightCm: number;
  onHeightChange: (h: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  userHeightCm,
  onHeightChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
          <Scissors className="w-5 h-5" />
        </div>
        <div>
          <div className="font-black text-xl text-white tracking-wider flex items-center gap-1.5">
            <span className="text-cyan-400">TailorFit</span> AI
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              PRO v2.4
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">AI-Powered Human Body Measurement Platform</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
        <button
          onClick={() => onTabChange('scan')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'scan'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Scan Studio</span>
        </button>

        <button
          onClick={() => onTabChange('tailor')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'tailor'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Tailor Portal</span>
        </button>

        <button
          onClick={() => onTabChange('customer')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'customer'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Customer Profile</span>
        </button>

        <button
          onClick={() => onTabChange('accuracy')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'accuracy'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI Spec Engine</span>
        </button>
      </div>

      {/* Quick Calibration Height Input */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
        <span className="text-slate-400 font-medium">Height Scale:</span>
        <input
          type="number"
          value={userHeightCm}
          onChange={(e) => onHeightChange(Number(e.target.value) || 178)}
          className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 font-mono font-bold text-xs text-center outline-none focus:border-cyan-500"
        />
        <span className="text-slate-400 font-bold">cm</span>
      </div>
    </header>
  );
};
