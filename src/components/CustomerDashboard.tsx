'use client';

import React, { useState } from 'react';
import { User, Calendar, FileText, TrendingUp, Sparkles, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { BodyMeasurementItem } from '@/types/measurement';

interface CustomerDashboardProps {
  currentMeasurements: BodyMeasurementItem[];
  onOpenReport: () => void;
  unit: 'cm' | 'inches';
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentMeasurements,
  onOpenReport,
  unit,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'fit_tracker'>('profile');

  // History mock records
  const scanHistory = [
    {
      id: 'SCAN-2026-08',
      date: 'Aug 10, 2026',
      chestCm: 104.2,
      waistCm: 84.5,
      hipCm: 98.0,
      confidence: 98.4,
      tailor: 'Savile Row Atelier',
    },
    {
      id: 'SCAN-2026-05',
      date: 'May 14, 2026',
      chestCm: 105.0,
      waistCm: 86.2,
      hipCm: 99.1,
      confidence: 97.8,
      tailor: 'Bespoke Studio',
    },
    {
      id: 'SCAN-2026-01',
      date: 'Jan 20, 2026',
      chestCm: 106.1,
      waistCm: 88.0,
      hipCm: 100.2,
      confidence: 96.5,
      tailor: 'Bespoke Studio',
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Customer Profile Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/20">
            MV
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Marcus Vance</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Verified Fit Profile
              </span>
            </h2>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>Height: 180 cm</span>
              <span>•</span>
              <span>Weight: 76 kg</span>
              <span>•</span>
              <span>Primary Tailor: Savile Row Atelier</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenReport}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
        >
          <FileText className="w-4 h-4" />
          <span>Download Measurement Card</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Current Tailoring Spec</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scan History ({scanHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fit_tracker')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'fit_tracker'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Body Fit Trend Tracker</span>
        </button>
      </div>

      {/* Tab 1: Profile Key Metrics */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentMeasurements.slice(0, 9).map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-xs text-slate-400 font-medium">{m.name}</div>
                <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                  {unit === 'cm' ? `${m.valueCm} cm` : `${m.valueInches}"`}
                </div>
              </div>
              <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400">
                {m.confidenceScore}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Scan History */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-3">
          {scanHistory.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-slate-800 text-cyan-400 font-mono font-bold text-xs">
                  {rec.id}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{rec.date}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Chest: {rec.chestCm} cm • Waist: {rec.waistCm} cm • Hips: {rec.hipCm} cm
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-emerald-400">{rec.confidence}% AI Accuracy</span>
                <button
                  onClick={onOpenReport}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Fit Trend Tracker */}
      {activeTab === 'fit_tracker' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Waist & Body Girth Trend (Last 8 Months)</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono">-3.5 cm Waist Reduction</span>
          </div>

          {/* Simple Visual Trend Chart Bar Representation */}
          <div className="h-40 flex items-end justify-between gap-4 pt-6 px-4 border-b border-slate-800 font-mono text-xs">
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-cyan-400">88.0 cm</span>
              <div className="w-full bg-cyan-500/30 rounded-t-lg" style={{ height: '80%' }} />
              <span className="text-slate-500 text-[10px]">Jan 2026</span>
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-cyan-400">86.2 cm</span>
              <div className="w-full bg-cyan-500/50 rounded-t-lg" style={{ height: '68%' }} />
              <span className="text-slate-500 text-[10px]">May 2026</span>
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-cyan-400 font-bold">84.5 cm</span>
              <div className="w-full bg-cyan-500 rounded-t-lg" style={{ height: '55%' }} />
              <span className="text-cyan-300 font-bold text-[10px]">Aug 2026 (Current)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
