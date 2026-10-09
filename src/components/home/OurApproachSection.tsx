"use client";

import React from 'react';
import { Truck, Scale, Banknote } from 'lucide-react';

export const OurApproachSection: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: "Doorstep Collection",
      desc: "Our trained executive arrives at your home or apartment at your scheduled time slot.",
      icon: <Truck className="w-5 h-5 text-[#F59E0B]" />,
      badge: "Step 1",
    },
    {
      id: 2,
      title: "Accurate Weighing",
      desc: "ISO certified Bluetooth digital weighing scales with real-time sync. Zero weight cuts.",
      icon: <Scale className="w-5 h-5 text-[#F59E0B]" />,
      badge: "Step 2",
    },
    {
      id: 3,
      title: "Instant Payment",
      desc: "Get instant cash in hand or immediate UPI transfer to your phone before we leave.",
      icon: <Banknote className="w-5 h-5 text-[#F59E0B]" />,
      badge: "Step 3",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
      <div>
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          The Asli Kaata Way
        </span>
        <h3 className="text-sm font-extrabold text-slate-900 mt-1">
          Our Approach — Simple. Transparent. Reliable.
        </h3>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-emerald-50/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0A3D2B] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                <span className="text-[9px] font-bold text-slate-400">{step.badge}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
