'use client';

import React, { useState } from 'react';
import { BodyMeasurementItem, MeasurementCategory } from '@/types/measurement';
import { Download, FileText, CheckCircle2, Edit2, ArrowRight, ShieldCheck } from 'lucide-react';
import { AccuracyValidationResult } from '@/lib/validationEngine';
import { AccuracyDashboard } from '@/components/AccuracyDashboard';

interface MeasurementResultsProps {
  measurements: BodyMeasurementItem[];
  unit: 'cm' | 'inches';
  onUnitChange: (newUnit: 'cm' | 'inches') => void;
  onUpdateMeasurement: (id: string, newValCm: number) => void;
  onOpenPdfReport: () => void;
  overallConfidence: number;
  validation?: AccuracyValidationResult | null;
  userHeightCm: number;
}

export const MeasurementResults: React.FC<MeasurementResultsProps> = ({
  measurements,
  unit,
  onUnitChange,
  onUpdateMeasurement,
  onOpenPdfReport,
  overallConfidence,
  validation,
  userHeightCm,
}) => {
  const [activeCategory, setActiveCategory] = useState<MeasurementCategory | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const categories: { id: MeasurementCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All 20 Specs' },
    { id: 'neck', label: 'Neck' },
    { id: 'upper_body', label: 'Upper Body' },
    { id: 'arms', label: 'Arms' },
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

  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto sm:max-w-xl">
      {/* Header Banner */}
      <div className="wellness-card-green p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#1a2e30]">Validated Body Fit Specs</h2>
            <p className="text-xs text-[#5b7173] mt-0.5">20 Perimeters extracted with strict accuracy quality gates.</p>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-white text-xs font-extrabold text-[#0d484b] shadow-sm">
            {overallConfidence}% Lock
          </span>
        </div>
      </div>

      {/* Accuracy Inspector Dashboard */}
      {validation && <AccuracyDashboard validation={validation} userHeightCm={userHeightCm} />}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-[#0d484b] text-white shadow-md'
                : 'bg-white text-[#5b7173] border border-[#1a2e30]/10 hover:text-[#1a2e30]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredMeasurements.map((item) => {
          const displayVal = unit === 'cm' ? item.valueCm : item.valueInches;
          const unitLabel = unit === 'cm' ? 'cm' : 'in';
          const isEditing = editingId === item.id;
          const confScore = Math.round(item.confidenceScore * 10) / 10;

          return (
            <div
              key={item.id}
              className="wellness-card p-4 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-extrabold text-sm text-[#1a2e30]">{item.name}</div>
                  <div className="text-[11px] text-[#5b7173] mt-0.5">{item.tailorNotes}</div>
                </div>

                <button
                  onClick={() => (isEditing ? handleSaveEdit(item.id) : handleStartEdit(item))}
                  className="p-1.5 rounded-full bg-[#ebf3f2] text-[#0d484b] hover:bg-[#dcf2eb]"
                >
                  {isEditing ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-end justify-between mt-3 pt-3 border-t border-[#1a2e30]/10">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={editValue}
                      onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 rounded-xl bg-[#ebf3f2] border border-[#0d484b] text-[#1a2e30] font-mono text-xs font-bold"
                    />
                    <span className="text-xs text-[#5b7173] font-bold">{unitLabel}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-2xl font-black text-[#1a2e30]">{displayVal}</span>
                    <span className="text-xs font-bold text-[#5b7173]">{unitLabel}</span>
                  </div>
                )}

                <span className="text-[10px] font-mono text-[#0d484b] bg-[#dcf2eb] px-2.5 py-0.5 rounded-full font-bold">
                  {confScore}% Conf
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SINGLE PRIMARY CTA */}
      <button
        onClick={onOpenPdfReport}
        className="wellness-pill-primary px-8 py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md mt-2"
      >
        <FileText className="w-4 h-4" />
        <span>Save Profile &amp; Export Tech Pack</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
