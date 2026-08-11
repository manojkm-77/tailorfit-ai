'use client';

import React from 'react';
import { BodyMeasurementItem } from '@/types/measurement';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CircularDialGaugeProps {
  overallConfidence: number;
  measurements: BodyMeasurementItem[];
  unit: 'cm' | 'inches';
  userHeightCm: number;
}

export const CircularDialGauge: React.FC<CircularDialGaugeProps> = ({
  overallConfidence = 98.4,
  measurements,
  unit,
  userHeightCm,
}) => {
  // Generate 60 radial ticks for the circular gauge matching reference center phone UI
  const ticks = Array.from({ length: 60 });

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. Hero Radial Circular Gauge Card matching middle screen UI */}
      <div className="obsidian-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="text-[11px] text-[#9ea0a6] font-semibold tracking-wider uppercase font-mono">
          AI Scan Accuracy Rating
        </div>

        {/* Circular Dial Radial Ticks Gauge */}
        <div className="relative w-56 h-56 my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
            {ticks.map((_, i) => {
              const angle = (i * 360) / 60;
              const isActive = i / 60 <= overallConfidence / 100;
              return (
                <div
                  key={i}
                  className="absolute w-1 h-3.5 origin-bottom"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-90px)`,
                    backgroundColor: isActive
                      ? i < 20
                        ? '#10b981'
                        : i < 40
                        ? '#06b6d4'
                        : '#8b5cf6'
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                  }}
                />
              );
            })}
          </div>

          {/* Center Digital Reading */}
          <div className="flex flex-col items-center justify-center z-10 font-mono">
            <span className="text-4xl font-black text-white tracking-tight">{overallConfidence}%</span>
            <span className="text-[10px] text-[#9ea0a6] font-sans font-bold uppercase tracking-widest mt-0.5">
              Pose Lock
            </span>
          </div>
        </div>

        <div className="text-xs font-semibold text-white flex items-center gap-1.5 bg-[#18181c] px-3.5 py-1.5 rounded-full border border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>33 Landmark BlazePose Model Verified</span>
        </div>
      </div>

      {/* 2. Body Girth Ratios List matching reference middle screen */}
      <div className="obsidian-card p-4 sm:p-5 flex flex-col gap-3">
        <div className="text-xs font-bold text-white flex items-center justify-between">
          <span>Body Girth Ratios</span>
          <span className="text-[10px] text-[#9ea0a6] font-mono">Calibrated {userHeightCm}cm</span>
        </div>

        <div className="space-y-2">
          {measurements.slice(0, 3).map((m) => {
            const val = unit === 'cm' ? `${m.valueCm} cm` : `${m.valueInches}"`;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#18181c] border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="font-semibold text-white">{m.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-white">{val}</span>
                  <span className="text-[10px] text-emerald-400">{Math.round(m.confidenceScore)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Measurement Progress Checklist matching reference right screen */}
      <div className="obsidian-card p-4 sm:p-5 flex flex-col gap-3">
        <div className="text-xs font-bold text-white flex items-center justify-between">
          <span>Key Metrics Checklist</span>
          <span className="text-[10px] text-cyan-400 font-mono">20/20 Complete</span>
        </div>

        <div className="space-y-2">
          {measurements.slice(3, 8).map((m) => {
            const val = unit === 'cm' ? `${m.valueCm} cm` : `${m.valueInches}"`;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#18181c] border border-white/5 text-xs hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-[10px] text-[#9ea0a6]">{m.tailorNotes}</div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-white text-xs">{val}</div>
                  <div className="text-[9px] text-[#9ea0a6]">Confidence {Math.round(m.confidenceScore)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
