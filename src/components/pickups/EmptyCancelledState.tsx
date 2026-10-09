"use client";

import React from 'react';
import { X, FileText } from 'lucide-react';

interface EmptyCancelledStateProps {
  title?: string;
  subtitle?: string;
}

export const EmptyCancelledState: React.FC<EmptyCancelledStateProps> = ({
  title = 'No more cancelled pickups',
  subtitle = 'Your cancelled requests will appear here for future reference.',
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4 text-center">
      {/* Decorative Document + Red X Badge Graphic matching Image 5 Screen 3 */}
      <div className="relative mb-5 flex items-center justify-center">
        {/* Soft Background Cloud Shape */}
        <div className="absolute -top-3 -right-4 w-12 h-6 bg-slate-200/50 rounded-full blur-xs pointer-events-none" />

        {/* Decorative Green Foliage Leaves */}
        <div className="absolute -bottom-2 -left-3 text-2xl rotate-[-25deg] select-none pointer-events-none">
          🌿
        </div>
        <div className="absolute -bottom-2 -right-3 text-2xl rotate-[25deg] scale-x-[-1] select-none pointer-events-none">
          🌿
        </div>

        {/* Document Card */}
        <div className="w-24 h-32 rounded-2xl bg-white border-2 border-slate-200 shadow-sm p-3 flex flex-col justify-between relative z-10">
          {/* Document Lines */}
          <div className="space-y-1.5 pt-1">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            <div className="w-16 h-1.5 bg-slate-200 rounded-full" />
            <div className="w-14 h-1.5 bg-slate-200 rounded-full" />
          </div>

          {/* Centered Red Seal with White X */}
          <div className="self-center my-auto w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md border-2 border-white ring-4 ring-rose-100">
            <X className="w-6 h-6 stroke-[3]" />
          </div>

          {/* Bottom Document Lines */}
          <div className="space-y-1 pb-1">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Headings */}
      <h3 className="text-sm font-black text-slate-900 tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 max-w-xs font-medium leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
};
