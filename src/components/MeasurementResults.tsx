'use client';

import React, { useState } from 'react';
import { BodyMeasurementItem, MeasurementCategory } from '@/types/measurement';
import { Download, FileText, CheckCircle2, Edit2, ShieldCheck } from 'lucide-react';

interface MeasurementResultsProps {
  measurements: BodyMeasurementItem[];
  unit: 'cm' | 'inches';
  onUnitChange: (newUnit: 'cm' | 'inches') => void;
  onUpdateMeasurement: (id: string, newValCm: number) => void;
  onOpenPdfReport: () => void;
  overallConfidence: number;
}

export const MeasurementResults: React.FC<MeasurementResultsProps> = ({
  measurements,
  unit,
  onUnitChange,
  onUpdateMeasurement,
  onOpenPdfReport,
  overallConfidence,
}) => {
  const [activeCategory, setActiveCategory] = useState<MeasurementCategory | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const categories: { id: MeasurementCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All (20 Metrics)' },
    { id: 'neck', label: 'Head & Neck' },
    { id: 'upper_body', label: 'Upper Body' },
    { id: 'arms', label: 'Arms & Sleeves' },
    { id: 'torso', label: 'Torso & Waist' },
    { id: 'lower_body', label: 'Lower Body' },
    { id: 'full_body', label: 'Full Body' },
  ];

  const filteredMeasurements =
    activeCategory === 'all'
      ? measurements
      : measurements.filter((m) => m.category === activeCategory);

  const handleStartEdit = (item: BodyMeasurementItem) => {
    setEditingId(item.id);
    setEditValue(unit === 'cm' ? item.valueCm : item.valueInches);
  };

  const handleSaveEdit = (id: string) => {
    const valCm = unit === 'cm' ? editValue : editValue * 2.54;
    onUpdateMeasurement(id, valCm);
    setEditingId(null);
  };

  const handleExportCsv = () => {
    const headers = ['Measurement ID', 'Name', 'Category', 'Value (cm)', 'Value (in)', 'Confidence (%)', 'Notes'];
    const rows = measurements.map((m) => [
      m.id,
      `"${m.name}"`,
      m.category,
      m.valueCm,
      m.valueInches,
      m.confidenceScore,
      `"${m.tailorNotes}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tailorfit_measurements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header & Action Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <span>Estimated Tailoring Specs</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {overallConfidence}% Lock
              </span>
            </h2>
            <p className="text-xs text-slate-400">Digital garment dimensions ready for pattern drafting.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={onOpenPdfReport}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tailor Tech Pack</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              activeCategory === cat.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Responsive Measurement Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredMeasurements.map((item) => {
          const displayVal = unit === 'cm' ? item.valueCm : item.valueInches;
          const unitLabel = unit === 'cm' ? 'cm' : 'in';
          const isEditing = editingId === item.id;
          const roundedConf = Math.round(item.confidenceScore * 10) / 10;

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-100 text-xs sm:text-sm">{item.name}</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-mono bg-slate-800 text-slate-400">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.tailorNotes}</div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => (isEditing ? handleSaveEdit(item.id) : handleStartEdit(item))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 shrink-0"
                >
                  {isEditing ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Value & Confidence Display */}
              <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-800/80">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={editValue}
                      onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-cyan-500 text-cyan-300 font-mono text-xs font-bold"
                    />
                    <span className="text-xs text-slate-400">{unitLabel}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-xl sm:text-2xl font-black text-cyan-400">{displayVal}</span>
                    <span className="text-xs font-bold text-slate-400">{unitLabel}</span>
                  </div>
                )}

                {/* Confidence Meter */}
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[10px] text-slate-400 font-mono">Confidence: {roundedConf}%</div>
                  <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                      style={{ width: `${roundedConf}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
