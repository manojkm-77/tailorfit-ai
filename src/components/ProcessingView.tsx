'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { PageView } from './Header';

interface ProcessingViewProps {
  onComplete: () => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [stepLabel, setStepLabel] = useState('Detecting body posture...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setStepLabel('Computing silhouette contours...');
    }, 600);

    const t2 = setTimeout(() => {
      setProgress(80);
      setStepLabel('Calculating 20 tailoring circumferences...');
    }, 1200);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStepLabel('Fit profile ready!');
      setTimeout(onComplete, 400);
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] w-full max-w-md mx-auto text-center px-4">
      <div className="wellness-card p-8 w-full flex flex-col items-center gap-6 shadow-xl">
        {/* Soft Pastel Pulse Bubble */}
        <div className="w-24 h-24 rounded-full bg-[#dcf2eb] flex items-center justify-center text-[#0d484b] animate-pulse-gentle relative">
          <Sparkles className="w-10 h-10 text-[#0d484b]" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-[#1a2e30]">Measuring Body Contours</h2>
          <p className="text-xs text-[#5b7173] font-medium mt-1">{stepLabel}</p>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-[#ebf3f2] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0d484b] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-xs font-mono font-bold text-[#0d484b] bg-[#dcf2eb] px-3.5 py-1 rounded-full">
          {progress}% Completed
        </span>
      </div>
    </div>
  );
};
