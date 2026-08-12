'use client';

import React, { useRef, useState, useMemo } from 'react';
import { X, Printer, Download, Scissors, ShieldCheck, Calendar, User, Loader2, Layers } from 'lucide-react';
import { BodyMeasurementItem } from '@/types/measurement';
import { applyEaseToBodyMeasurements, FitProfile, GarmentType } from '@/lib/easeEngine';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [exporting, setExporting] = useState(false);
  const [garmentType, setGarmentType] = useState<GarmentType>('Suit');
  const [fitProfile, setFitProfile] = useState<FitProfile>('regular');
  const reportId = useMemo(() => `TR-${Math.floor(100000 + Math.random() * 900000)}`, [isOpen]);

  // Calculate Pattern Cut Sheet Measurements based on selected Garment & Fit Profile
  const cutSheetMeasurements = useMemo(
    () => applyEaseToBodyMeasurements(measurements, garmentType, fitProfile),
    [measurements, garmentType, fitProfile]
  );

  if (!isOpen) return null;

  const scanDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleExportPdf = async () => {
    const node = reportRef.current;
    if (!node || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#08080a',
        useCORS: true,
        logging: false,
      });
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`TailorFit_TechPack_${reportId}.pdf`);
    } catch (err) {
      console.error('[TailorFit] PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#08080a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-[#121215]">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white text-sm">Tailoring Measurement Specification Report</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              className="px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs flex items-center gap-2 transition-all hover:bg-white/90 disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <Download className="w-4 h-4 text-black" />
              )}
              <span>{exporting ? 'Rendering PDF…' : 'Download PDF Tech Pack'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-[#18181c] border border-white/10 text-white hover:bg-white/10 transition-all"
              title="Print Tech Pack"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#18181c] border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Garment Ease Selector Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-3 border-b border-white/10 bg-[#18181c]/80 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Garment Cut Sheet Options:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Garment Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#9ea0a6]">Type:</span>
              <select
                value={garmentType}
                onChange={(e) => setGarmentType(e.target.value as GarmentType)}
                className="px-2.5 py-1 rounded-lg bg-[#08080a] border border-white/15 text-white font-semibold outline-none"
              >
                <option value="Suit">Suit Jacket</option>
                <option value="Shirt">Dress Shirt</option>
                <option value="Trousers">Trousers</option>
                <option value="Dress">Bespoke Dress</option>
              </select>
            </div>

            {/* Fit Profile */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#9ea0a6]">Fit Profile:</span>
              <select
                value={fitProfile}
                onChange={(e) => setFitProfile(e.target.value as FitProfile)}
                className="px-2.5 py-1 rounded-lg bg-[#08080a] border border-white/15 text-white font-semibold outline-none"
              >
                <option value="slim">Slim (+2..+4cm)</option>
                <option value="regular">Regular (+6..+8cm)</option>
                <option value="relaxed">Relaxed (+10cm+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div ref={reportRef} className="p-8 bg-[#08080a] text-white flex flex-col gap-6" id="printable-report">
          {/* Header Specs */}
          <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="text-2xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                <span>TailorFit</span> <span className="text-cyan-400">AI</span>
              </div>
              <div className="text-xs text-[#9ea0a6] mt-1">
                Precision Computer Vision Body Measurement Engine v2.4
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-[#9ea0a6] font-mono">Report ID: <span className="text-cyan-400 font-bold">{reportId}</span></div>
                <div className="text-xs text-[#9ea0a6] font-mono mt-0.5 flex items-center justify-end gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#9ea0a6]" />
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#121215] border border-white/10 text-xs">
            <div>
              <div className="text-[#9ea0a6] font-medium">Customer Name</div>
              <div className="text-white font-bold text-sm mt-0.5">{customerName || 'Client #4029'}</div>
            </div>
            <div>
              <div className="text-[#9ea0a6] font-medium">Gender / Fitting</div>
              <div className="text-cyan-400 font-bold text-sm capitalize mt-0.5">{gender}</div>
            </div>
            <div>
              <div className="text-[#9ea0a6] font-medium">Standing Height</div>
              <div className="text-white font-bold text-sm mt-0.5">{heightCm} cm ({Math.round(heightCm / 2.54)}" in)</div>
            </div>
            <div>
              <div className="text-[#9ea0a6] font-medium">Calibrated Weight</div>
              <div className="text-white font-bold text-sm mt-0.5">{weightKg} kg</div>
            </div>
          </div>

          {/* Body Measurements Specification Table */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Raw Anatomical Body Dimensions</span>
            </h3>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#121215]">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-[#18181c] text-[#9ea0a6] font-mono uppercase text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Measurement Specification</th>
                    <th className="py-3 px-4">Body Region</th>
                    <th className="py-3 px-4 text-right">Metric ({unit})</th>
                    <th className="py-3 px-4 text-right">Confidence</th>
                    <th className="py-3 px-4">Pattern Fitting Guidelines</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {measurements.map((m) => {
                    const displayVal = unit === 'cm' ? m.valueCm : m.valueInches;
                    return (
                      <tr key={m.id} className="hover:bg-white/5">
                        <td className="py-2.5 px-4 font-bold text-white">{m.name}</td>
                        <td className="py-2.5 px-4 text-[#9ea0a6] capitalize">{m.category.replace('_', ' ')}</td>
                        <td className="py-2.5 px-4 text-right text-cyan-400 font-black text-sm">{displayVal} {unit}</td>
                        <td className="py-2.5 px-4 text-right text-emerald-400">{Math.round(m.confidenceScore * 10) / 10}%</td>
                        <td className="py-2.5 px-4 text-[#9ea0a6] text-[11px] font-sans">{m.tailorNotes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Garment Allowance Cut Sheet Table */}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Pattern Cut Sheet ({garmentType} · {fitProfile.toUpperCase()} FIT)</span>
              </h3>
              <span className="text-xs text-[#9ea0a6] font-mono">Body Girth + Ease Allowance</span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#121215]">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-[#18181c] text-[#9ea0a6] font-mono uppercase text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Garment Cut Perimeter</th>
                    <th className="py-3 px-4 text-right">Body Dimension</th>
                    <th className="py-3 px-4 text-right">Ease Allowance</th>
                    <th className="py-3 px-4 text-right">Final Pattern Cut ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {cutSheetMeasurements.slice(0, 8).map((m, idx) => {
                    const bodyVal = unit === 'cm' ? measurements[idx]?.valueCm : measurements[idx]?.valueInches;
                    const cutVal = unit === 'cm' ? m.valueCm : m.valueInches;
                    const easeVal = Math.round(((cutVal || 0) - (bodyVal || 0)) * 10) / 10;
                    return (
                      <tr key={m.id} className="hover:bg-white/5">
                        <td className="py-2.5 px-4 font-bold text-white">{m.name} Pattern Cut</td>
                        <td className="py-2.5 px-4 text-right text-[#9ea0a6]">{bodyVal} {unit}</td>
                        <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">+{easeVal} {unit}</td>
                        <td className="py-2.5 px-4 text-right text-white font-black text-sm">{cutVal} {unit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Tailor Signoff */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs text-[#9ea0a6]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified TailorFit AI Pose Model • Approved for Cutting &amp; Pattern Drafting</span>
            </div>
            <div>Tailor Signature: _______________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};
