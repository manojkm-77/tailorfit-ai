'use client';

import React from 'react';
import { FileText, Download, Printer, ShieldCheck, ArrowRight, Layers } from 'lucide-react';
import { BodyMeasurementItem } from '@/types/measurement';
import { MobileTab } from './BottomNav';

interface MobileReportsViewProps {
  onOpenPdfReport: () => void;
  measurements: BodyMeasurementItem[];
  unit: 'cm' | 'inches';
  userHeightCm: number;
}

export const MobileReportsView: React.FC<MobileReportsViewProps> = ({
  onOpenPdfReport,
  measurements,
  unit,
  userHeightCm,
}) => {
  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto sm:max-w-xl pb-20 sm:pb-0">
      {/* Header Banner */}
      <div className="wellness-card-lavender p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#8b5cf6]" />
          <h2 className="text-xl font-extrabold text-[#1a2e30]">Garment Tech Pack Reports</h2>
        </div>
        <p className="text-xs text-[#5b7173]">
          Generate vector PDF cut sheets with garment ease allowances for master tailors.
        </p>
      </div>

      {/* Report Summary Card */}
      <div className="wellness-card p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1a2e30]/10 pb-4">
          <div>
            <div className="text-base font-extrabold text-[#1a2e30]">Bespoke Suit Tech Pack</div>
            <div className="text-xs text-[#5b7173] font-medium">Customer: Marcus Vance ({userHeightCm}cm)</div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#dcf2eb] text-[11px] font-extrabold text-[#0d484b]">
            20 Metrics Lock
          </span>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-[#1a2e30] font-semibold">
            <div className="w-2 h-2 rounded-full bg-[#0d484b]" />
            <span>Raw Body Perimeters (Ramanujan Ellipse Basis)</span>
          </div>

          <div className="flex items-center gap-2 text-[#1a2e30] font-semibold">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
            <span>Garment Ease Allowance Cut Sheet (Slim, Regular, Relaxed)</span>
          </div>

          <div className="flex items-center gap-2 text-[#1a2e30] font-semibold">
            <div className="w-2 h-2 rounded-full bg-[#e88ab4]" />
            <span>QR Code Scan Verification &amp; Tailor Signature Block</span>
          </div>
        </div>

        {/* SINGLE PRIMARY CTA */}
        <button
          onClick={onOpenPdfReport}
          className="wellness-pill-primary px-8 py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md mt-2"
        >
          <Download className="w-4 h-4" />
          <span>Generate PDF Tech Pack Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
