'use client';

import React from 'react';
import { CheckCircle2, TrendingDown } from 'lucide-react';

interface WaveFitGraphProps {
  unit: 'cm' | 'inches';
}

export const WaveFitGraph: React.FC<WaveFitGraphProps> = ({ unit }) => {
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. Interactive SVG Wave Graph Card matching right phone UI */}
      <div className="obsidian-card p-5 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Waist Girth History</h3>
            <p className="text-[11px] text-[#9ea0a6]">8 Months Trend Variance</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>-3.5 cm</span>
          </span>
        </div>

        {/* Interactive Wave Line Graph */}
        <div className="relative h-32 w-full mt-2 flex items-center justify-center">
          {/* Highlight pill floating over graph matching reference image */}
          <div className="absolute top-1 left-[58%] -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#24242a] border border-white/20 text-[9px] font-mono text-white font-bold shadow-lg z-10">
            Aug Scan
          </div>

          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
            {/* Grid dotted line */}
            <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

            {/* Glowing Gradient fill under wave */}
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <path
              d="M 0 70 Q 50 30, 100 65 T 200 40 T 300 60 L 300 100 L 0 100 Z"
              fill="url(#waveGrad)"
            />

            {/* Wave Line */}
            <path
              d="M 0 70 Q 50 30, 100 65 T 200 40 T 300 60"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="animate-wave-pulse"
            />

            {/* Data points */}
            <circle cx="0" cy="70" r="3.5" fill="#ffffff" />
            <circle cx="60" cy="45" r="3.5" fill="#ffffff" />
            <circle cx="120" cy="60" r="3.5" fill="#ffffff" />
            <circle cx="180" cy="40" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="240" cy="50" r="3.5" fill="#ffffff" />
            <circle cx="300" cy="60" r="3.5" fill="#ffffff" />
          </svg>
        </div>

        {/* X-Axis labels matching reference UI */}
        <div className="flex justify-between text-[10px] text-[#9ea0a6] font-mono pt-1 border-t border-white/5">
          <span>Jan</span>
          <span>Mar</span>
          <span>May</span>
          <span className="text-white font-bold">Aug</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </div>

      {/* 2. Circular Stage Verification Card matching reference right screen UI */}
      <div className="obsidian-card p-4 sm:p-5 flex items-center gap-4">
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center font-mono font-bold text-xs text-white">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="98, 100"
            />
          </svg>
          <span className="absolute text-sm">98%</span>
        </div>

        <div>
          <div className="text-[10px] text-[#9ea0a6] uppercase font-mono tracking-wider font-semibold">Stage 3 Verification</div>
          <div className="text-xs sm:text-sm font-bold text-white mt-0.5">Automated Pattern Cutting Specs</div>
          <div className="text-[11px] text-[#9ea0a6] mt-0.5">Approved by Master Tailor Pietro</div>
        </div>
      </div>

      {/* 3. Task Timeline List matching right screen in reference UI */}
      <div className="obsidian-card p-4 sm:p-5 flex flex-col gap-3">
        <div className="text-xs font-bold text-white">Fitting Pipeline Logs</div>

        <div className="space-y-3">
          {[
            { title: 'Run A/B AI Pose Alignment Check', time: '12:11', status: 'done' },
            { title: 'Compute Ramanujan Ellipse Circumferences', time: '13:22', status: 'done' },
            { title: 'Generate Tailor Specification Tech Pack', time: '15:41', status: 'done' },
            { title: 'Send Cutting Pattern to Workshop', time: '16:54', status: 'pending' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    item.status === 'done'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-[#24242a] text-[#71717a] border border-white/5'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className={item.status === 'done' ? 'text-white font-medium' : 'text-[#71717a]'}>
                  {item.title}
                </span>
              </div>
              <span className="text-[10px] text-[#9ea0a6] font-mono">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
