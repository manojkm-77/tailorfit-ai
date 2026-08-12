'use client';

import React from 'react';
import { SlidersHorizontal, Camera, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

export type StepId = 1 | 2 | 3 | 4;

interface StepWizardNavProps {
  currentStep: StepId;
  onStepClick: (step: StepId) => void;
}

const STEPS: { id: StepId; label: string; sub: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 1, label: 'Calibration', sub: 'Height & Fitting', icon: SlidersHorizontal },
  { id: 2, label: 'Pose Capture', sub: 'Front & Side Photos', icon: Camera },
  { id: 3, label: 'Review Specs', sub: '20 Body Perimeters', icon: CheckCircle2 },
  { id: 4, label: 'Tech Pack', sub: 'Pattern Cut Sheet', icon: FileText },
];

export const StepWizardNav: React.FC<StepWizardNavProps> = ({ currentStep, onStepClick }) => {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full flex flex-col gap-3 bg-[#111318] border border-[#222630] rounded-2xl p-4 sm:p-5">
      {/* Step Header Title & Progress */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#8b90a0]">Step {currentStep} of 4</span>
          <span className="text-[#222630]">•</span>
          <span className="font-bold text-white">{STEPS[currentStep - 1].label}</span>
        </div>
        <span className="font-mono text-[#8b90a0] font-semibold">{Math.round(progressPercent)}% Completed</span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-1.5 bg-[#181b22] rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.max(8, progressPercent)}%` }}
        />
      </div>

      {/* Segmented Step Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isPassed = currentStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-white text-black border-white shadow-sm font-bold'
                  : isPassed
                  ? 'bg-[#181b22] text-white border-[#222630] hover:border-white/20'
                  : 'bg-[#111318] text-[#8b90a0] border-[#222630] hover:text-white'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 font-mono ${
                  isActive
                    ? 'bg-black text-white'
                    : isPassed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#181b22] text-[#8b90a0]'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Icon className="w-3.5 h-3.5" />}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold truncate">{step.label}</span>
                <span className={`text-[10px] truncate ${isActive ? 'text-black/70' : 'text-[#8b90a0]'}`}>
                  {step.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
