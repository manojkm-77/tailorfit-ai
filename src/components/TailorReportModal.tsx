'use client';

import React, { useRef } from 'react';
import { X, Printer, Download, QrCode, Scissors, ShieldCheck, Calendar, User } from 'lucide-react';
import { BodyMeasurementItem } from '@/types/measurement';
import { QRCodeSVG } from 'qrcode.react';

interface TailorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  gender: 'male' | 'female' | 'unisex';
  heightCm: number;
  weightKg?: number;
  measurements: BodyMeasurementItem[];
  unit: 'cm' | 'inches';
  scannedImageSrc?: string | null;
}

export const TailorReportModal: React.FC<TailorReportModalProps> = ({
  isOpen,
  onClose,
  customerName,
  gender,
  heightCm,
  weightKg = 72,
  measurements,
  unit,
  scannedImageSrc,
}) => {
  const reportRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const reportId = `TR-${Math.floor(100000 + Math.random() * 900000)}`;
  const scanDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-slate-100 text-sm">Tailoring Measurement Specification Report</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div ref={reportRef} className="p-8 bg-slate-900 text-slate-200 flex flex-col gap-6" id="printable-report">
          {/* Header Specs */}
          <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="text-2xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                <span className="text-cyan-400">TailorFit</span> AI
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Precision Computer Vision Body Measurement Engine v2.4
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">Report ID: <span className="text-cyan-300 font-bold">{reportId}</span></div>
                <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center justify-end gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Scan Date: {scanDate}</span>
                </div>
              </div>

              {/* QR Verification Code */}
              <div className="p-2 rounded-xl bg-white shrink-0">
                <QRCodeSVG value={`https://tailorfit.ai/verify/${reportId}`} size={56} />
              </div>
            </div>
          </div>

          {/* Customer Meta Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Customer Name</div>
              <div className="text-slate-100 font-bold text-sm mt-0.5">{customerName || 'Client #4029'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Gender / Fitting</div>
              <div className="text-cyan-300 font-bold text-sm capitalize mt-0.5">{gender}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Standing Height</div>
              <div className="text-slate-100 font-bold text-sm mt-0.5">{heightCm} cm ({Math.round(heightCm / 2.54)}" in)</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Calibrated Weight</div>
              <div className="text-slate-100 font-bold text-sm mt-0.5">{weightKg} kg</div>
            </div>
          </div>

          {/* Body Measurements Specification Table */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider text-cyan-400">
              Garment Cutting Specifications
            </h3>

            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Measurement Specification</th>
                    <th className="py-3 px-4">Body Region</th>
                    <th className="py-3 px-4 text-right">Metric ({unit})</th>
                    <th className="py-3 px-4 text-right">Confidence</th>
                    <th className="py-3 px-4">Pattern Fitting Guidelines</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {measurements.map((m) => {
                    const displayVal = unit === 'cm' ? m.valueCm : m.valueInches;
                    return (
                      <tr key={m.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-4 font-bold text-slate-100">{m.name}</td>
                        <td className="py-2.5 px-4 text-slate-400 capitalize">{m.category.replace('_', ' ')}</td>
                        <td className="py-2.5 px-4 text-right text-cyan-300 font-black text-sm">{displayVal} {unit}</td>
                        <td className="py-2.5 px-4 text-right text-emerald-400">{Math.round(m.confidenceScore * 10) / 10}%</td>
                        <td className="py-2.5 px-4 text-slate-400 text-[11px] font-sans">{m.tailorNotes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Tailor Signoff */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified TailorFit AI Pose Model • Approved for Cutting & Pattern Drafting</span>
            </div>
            <div>Tailor Signature: _______________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};
