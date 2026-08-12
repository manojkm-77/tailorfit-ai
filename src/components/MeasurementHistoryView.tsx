'use client';

import React from 'react';
import { History, TrendingDown, ArrowUpRight, Plus, Calendar, ShieldCheck } from 'lucide-react';
import { PageView } from './Header';

interface MeasurementHistoryViewProps {
  onNavigate: (page: PageView) => void;
  unit: 'cm' | 'inches';
}

export const MeasurementHistoryView: React.FC<MeasurementHistoryViewProps> = ({
  onNavigate,
  unit,
}) => {
  const historyScans = [
    {
      id: 'SC-904',
      date: 'Aug 12, 2026',
      chest: '104.2 cm',
      waist: '84.5 cm',
      hip: '98.2 cm',
      change: '-3.5 cm Waist',
      status: 'Current Fit Profile',
    },
    {
      id: 'SC-880',
      date: 'May 04, 2026',
      chest: '105.0 cm',
      waist: '88.0 cm',
      hip: '99.5 cm',
      change: '-1.2 cm Waist',
      status: 'Archived',
    },
    {
      id: 'SC-712',
      date: 'Jan 15, 2026',
      chest: '106.2 cm',
      waist: '89.2 cm',
      hip: '100.1 cm',
      change: 'Baseline',
      status: 'Archived',
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto sm:max-w-xl">
      {/* Header Banner */}
      <div className="wellness-card-lavender p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#8b5cf6]" />
          <h2 className="text-xl font-extrabold text-[#1a2e30]">Measurement Scan History</h2>
        </div>
        <p className="text-xs text-[#5b7173]">Track body girth variance and fitting trends over time.</p>
      </div>

      {/* History Log Timeline Cards */}
      <div className="flex flex-col gap-3.5">
        {historyScans.map((scan, idx) => (
          <div key={scan.id} className="wellness-card p-5 flex flex-col gap-3 hover:shadow-md transition-all">
            <div className="flex items-center justify-between border-b border-[#1a2e30]/10 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-bold text-[#0d484b]">{scan.id}</span>
                <span className="text-[#5b7173]">•</span>
                <span className="text-[#5b7173] flex items-center gap-1 font-sans">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{scan.date}</span>
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  idx === 0 ? 'bg-[#dcf2eb] text-[#0d484b]' : 'bg-[#ebf3f2] text-[#5b7173]'
                }`}
              >
                {scan.status}
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
              <div className="p-2.5 rounded-xl bg-[#ebf3f2]">
                <div className="text-[10px] text-[#5b7173] font-sans">Chest</div>
                <div className="font-bold text-[#1a2e30] mt-0.5">{scan.chest}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#ebf3f2]">
                <div className="text-[10px] text-[#5b7173] font-sans">Waist</div>
                <div className="font-bold text-[#1a2e30] mt-0.5">{scan.waist}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#ebf3f2]">
                <div className="text-[10px] text-[#5b7173] font-sans">Hip</div>
                <div className="font-bold text-[#1a2e30] mt-0.5">{scan.hip}</div>
              </div>
            </div>

            {/* Change Indicator */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{scan.change}</span>
              </div>

              <button
                onClick={() => onNavigate('results')}
                className="text-xs font-bold text-[#0d484b] hover:underline flex items-center gap-1"
              >
                <span>View Specs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Single Primary CTA */}
      <button
        onClick={() => onNavigate('photo_upload')}
        className="wellness-pill-primary px-8 py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md mt-2"
      >
        <Plus className="w-4 h-4" />
        <span>Perform New Measurement Scan</span>
      </button>
    </div>
  );
};
