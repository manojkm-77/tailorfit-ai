'use client';

import React from 'react';
import { AccuracyValidationResult } from '@/lib/validationEngine';
import { ShieldCheck, AlertCircle, Cpu, Sun, Activity, CheckCircle2, XCircle } from 'lucide-react';

interface AccuracyDashboardProps {
  validation: AccuracyValidationResult;
  userHeightCm: number;
}

export const AccuracyDashboard: React.FC<AccuracyDashboardProps> = ({
  validation,
  userHeightCm,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto sm:max-w-xl">
      {/* Header Banner */}
      <div className="wellness-card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#dcf2eb] text-[#0d484b] flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1a2e30]">AI Fit Accuracy Dashboard</h3>
              <p className="text-[11px] text-[#5b7173]">Computer Vision Quality Gates &amp; Validation Engine</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
              validation.isValid ? 'bg-[#dcf2eb] text-[#0d484b]' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {validation.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            <span>{validation.overallConfidence}% Overall Lock</span>
          </span>
        </div>

        {/* Quality Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center text-xs mt-1">
          <div className="p-3 rounded-2xl bg-[#ebf3f2] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#5b7173] font-sans font-bold">Landmarks</span>
            <span className="font-extrabold text-[#1a2e30]">{validation.landmarkConfidenceScore}%</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#ebf3f2] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#5b7173] font-sans font-bold">Segmentation</span>
            <span className="font-extrabold text-[#1a2e30]">{validation.segmentationScore}%</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#ebf3f2] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#5b7173] font-sans font-bold">Lighting</span>
            <span className="font-extrabold text-[#1a2e30]">{validation.lightingScore}/255</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#ebf3f2] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#5b7173] font-sans font-bold">Sharpness</span>
            <span className="font-extrabold text-[#1a2e30]">{validation.blurScore} Var</span>
          </div>
        </div>
      </div>

      {/* Validation Gate Checks Checklist */}
      <div className="wellness-card p-5 flex flex-col gap-3">
        <div className="text-xs font-bold text-[#1a2e30]">Quality Gate Inspection</div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ebf3f2]/60">
            <span className="font-semibold text-[#1a2e30]">Head &amp; Face Visibility</span>
            {validation.headVisible ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passed
              </span>
            ) : (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Missing
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ebf3f2]/60">
            <span className="font-semibold text-[#1a2e30]">Ankles &amp; Feet Visibility</span>
            {validation.anklesVisible ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passed
              </span>
            ) : (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Missing
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ebf3f2]/60">
            <span className="font-semibold text-[#1a2e30]">Standing Upright Alignment</span>
            {validation.isPoseStraight ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Straight
              </span>
            ) : (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Tilted
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ebf3f2]/60">
            <span className="font-semibold text-[#1a2e30]">Height Calibration Scale</span>
            <span className="font-mono font-bold text-[#0d484b]">{userHeightCm} cm Verified</span>
          </div>
        </div>
      </div>

      {/* Rejection Reasons Alert (If any gate failed) */}
      {validation.rejectionReasons.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Validation Rejection Feedback</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 font-medium text-[11px]">
            {validation.rejectionReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
