'use client';

import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, User, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { PoseLandmarks33 } from '@/types/measurement';
import { SAMPLE_MALE_LANDMARKS, SAMPLE_FEMALE_LANDMARKS, MALE_MODEL_SVG, FEMALE_MODEL_SVG } from '@/lib/sampleModels';

interface PhotoUploadScanProps {
  onProcessImages: (
    frontImg: string,
    sideImg: string | null,
    backImg: string | null,
    landmarks: PoseLandmarks33,
    gender: 'male' | 'female'
  ) => void;
}

export const PhotoUploadScan: React.FC<PhotoUploadScanProps> = ({ onProcessImages }) => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, view: 'front' | 'side' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      if (view === 'front') setFrontImage(result);
      if (view === 'side') setSideImage(result);
      if (view === 'back') setBackImage(result);
    };
    reader.readAsDataURL(file);
  };

  const loadSampleModel = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    if (gender === 'male') {
      setFrontImage(MALE_MODEL_SVG);
      setSideImage(null);
      setBackImage(null);
    } else {
      setFrontImage(FEMALE_MODEL_SVG);
      setSideImage(null);
      setBackImage(null);
    }
  };

  const handleRunAnalysis = () => {
    const activeFront = frontImage || (selectedGender === 'male' ? MALE_MODEL_SVG : FEMALE_MODEL_SVG);
    const activeLandmarks = selectedGender === 'male' ? SAMPLE_MALE_LANDMARKS : SAMPLE_FEMALE_LANDMARKS;

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onProcessImages(activeFront, sideImage, backImage, activeLandmarks, selectedGender);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto">
      {/* Fitting Profile Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h3 className="font-bold text-slate-100 text-sm sm:text-base">1. Select Fitting Profile</h3>
          <p className="text-xs text-slate-400">Calibrates anatomical proportion models and body girth ratios.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => loadSampleModel('male')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
              selectedGender === 'male'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Male Model Sample</span>
          </button>

          <button
            onClick={() => loadSampleModel('female')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
              selectedGender === 'female'
                ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Female Model Sample</span>
          </button>
        </div>
      </div>

      {/* Responsive Multi-Angle Photo Upload Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Front View Slot */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Front Photo (Required)</span>
            <span className="text-cyan-400 font-semibold">Primary Angle</span>
          </div>

          <label className="relative flex flex-col items-center justify-center h-52 sm:h-60 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-slate-900/60 hover:bg-slate-900 cursor-pointer overflow-hidden group transition-all">
            {frontImage ? (
              <div className="relative w-full h-full">
                <img src={frontImage} alt="Front View" className="w-full h-full object-contain p-2" />
                <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-slate-950">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <UploadCloud className="w-9 h-9 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-slate-300 font-semibold">Upload Front Photo</span>
                <span className="text-[10px] text-slate-500">JPG, PNG up to 10MB</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'front')}
            />
          </label>
        </div>

        {/* Side View Slot */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Side Photo (Optional)</span>
            <span className="text-slate-500">+4% Accuracy</span>
          </div>

          <label className="relative flex flex-col items-center justify-center h-52 sm:h-60 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/60 hover:bg-slate-900 cursor-pointer overflow-hidden group transition-all">
            {sideImage ? (
              <div className="relative w-full h-full">
                <img src={sideImage} alt="Side View" className="w-full h-full object-contain p-2" />
                <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-slate-950">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <ImageIcon className="w-9 h-9 text-slate-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-slate-300 font-semibold">Upload Side Photo</span>
                <span className="text-[10px] text-slate-500">Improves depth girths</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'side')}
            />
          </label>
        </div>

        {/* Back View Slot */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Back Photo (Optional)</span>
            <span className="text-slate-500">Posture Refinement</span>
          </div>

          <label className="relative flex flex-col items-center justify-center h-52 sm:h-60 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/60 hover:bg-slate-900 cursor-pointer overflow-hidden group transition-all">
            {backImage ? (
              <div className="relative w-full h-full">
                <img src={backImage} alt="Back View" className="w-full h-full object-contain p-2" />
                <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-slate-950">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <ImageIcon className="w-9 h-9 text-slate-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-slate-300 font-semibold">Upload Back Photo</span>
                <span className="text-[10px] text-slate-500">For shoulder curvature</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'back')}
            />
          </label>
        </div>
      </div>

      {/* Photo Guidelines Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Photo Requirements:</span> Stand straight wearing normal fitted clothes (t-shirt, jeans, activewear). Ensure good lighting and full height visibility from head to heels. AI automatically subtracts loose clothing margins.
        </div>
      </div>

      {/* Execute Analysis Action Button */}
      <div className="flex justify-center mt-1">
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-cyan-500/25 active:scale-95 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running Deep Pose Landmark Extraction...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Extract AI Tailoring Measurements</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
