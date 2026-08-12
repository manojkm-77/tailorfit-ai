'use client';

import React, { useState } from 'react';
import { BodyMeasurementItem, MeasurementCategory } from '@/types/measurement';
import { Download, FileText, CheckCircle2, Edit2, ShieldCheck, ArrowRight } from 'lucide-react';

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
    { id: 'all', label: 'All 20 Metrics' },
    { id: 'neck', label: 'Neck' },
    { id: 'upper_body', label: 'Upper Body' },
    { id: 'arms', label: 'Arms & Sleeves' },
    { id: 'torso', label: 'Torso' },
    { id: 'lower_body', label: 'Lower Body' },
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#111318] border border-[#222630]">
        <div>
          <div className="font-extrabold text-white text-base flex items-center gap-2">
            <span>20 Tailoring Perimeters</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {overallConfidence}% Pose Lock
            </span>
          </div>
          <p className="text-xs text-[#8b90a0] mt-0.5">Calculated via Ramanujan 3D Ellipse Geometry</p>
        </div>

        {/* Secondary CSV Export Action */}
        <button
          onClick={handleExportCsv}
          className="px-3.5 py-1.5 rounded-xl bg-[#181b22] border border-[#222630] text-white text-xs font-semibold hover:bg-[#222630] flex items-center gap-1.5 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              activeCategory === cat.id
                ? 'bg-white text-black border-white font-bold shadow-sm'
                : 'bg-[#111318] text-[#8b90a0] border-[#222630] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Metric Cards Grid (Linear / Stripe Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredMeasurements.map((item) => {
          const displayVal = unit === 'cm' ? item.valueCm : item.valueInches;
          const unitLabel = unit === 'cm' ? 'cm' : 'in';
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#111318] border border-[#222630] flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm">{item.name}</div>
                  <div className="text-[11px] text-[#8b90a0] mt-0.5">{item.tailorNotes}</div>
                </div>

                <button
                  onClick={() => (isEditing ? handleSaveEdit(item.id) : handleStartEdit(item))}
                  className="p-1.5 rounded-lg bg-[#181b22] text-[#8b90a0] hover:text-white border border-[#222630]"
                >
                  {isEditing ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-end justify-between mt-3 pt-3 border-t border-[#222630]">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={editValue}
                      onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 rounded-lg bg-[#090a0f] border border-white text-white font-mono text-xs font-bold"
                    />
                    <span className="text-xs text-[#8b90a0]">{unitLabel}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-xl font-black text-white">{displayVal}</span>
                    <span className="text-xs font-bold text-[#8b90a0]">{unitLabel}</span>
                  </div>
                )}

                <div className="text-[10px] text-[#8b90a0] font-mono">
                  Score: <span className="text-emerald-400 font-bold">{Math.round(item.confidenceScore)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SINGLE PRIMARY CTA BUTTON FOR TECH PACK GENERATION */}
      <div className="flex justify-center mt-3">
        <button
          onClick={onOpenPdfReport}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:bg-white/90 shadow-sm"
        >
          <FileText className="w-4 h-4 text-black" />
          <span>Generate Garment Tech Pack</span>
          <ArrowRight className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
};
