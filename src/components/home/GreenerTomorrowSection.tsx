"use client";

import React from 'react';
import { Leaf, Award, Recycle } from 'lucide-react';

export const GreenerTomorrowSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-3.5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
          <Leaf className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-900 leading-tight">Together For A Greener Tomorrow</h3>
          <p className="text-[10px] text-emerald-800 font-semibold">100% Ethical Recycling in Vijayawada</p>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Your scrap today builds a cleaner, healthier, and more sustainable community. We ensure zero waste ends up in open landfills.
      </p>

      {/* 3 Impact Badges */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="p-2 rounded-2xl bg-white border border-emerald-100/80 shadow-2xs">
          <Recycle className="w-4 h-4 text-emerald-600 mx-auto mb-0.5" />
          <span className="text-xs font-black text-[#0A3D2B] block">100+ Tons</span>
          <span className="text-[9px] text-slate-500 font-medium">Recycled</span>
        </div>
        <div className="p-2 rounded-2xl bg-white border border-emerald-100/80 shadow-2xs">
          <Award className="w-4 h-4 text-[#F59E0B] mx-auto mb-0.5" />
          <span className="text-xs font-black text-[#0A3D2B] block">5,000+</span>
          <span className="text-[9px] text-slate-500 font-medium">Happy Users</span>
        </div>
        <div className="p-2 rounded-2xl bg-white border border-emerald-100/80 shadow-2xs">
          <Leaf className="w-4 h-4 text-emerald-600 mx-auto mb-0.5" />
          <span className="text-xs font-black text-[#0A3D2B] block">100%</span>
          <span className="text-[9px] text-slate-500 font-medium">Eco Traceable</span>
        </div>
      </div>
    </div>
  );
};
