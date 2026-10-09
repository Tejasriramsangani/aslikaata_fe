"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Package } from 'lucide-react';
import { usePickupBooking, AVAILABLE_WEIGHT_RANGES } from '../../context/PickupBookingContext';

interface WeightRangeStepProps {
  onBack: () => void;
  onNext: () => void;
}

export const WeightRangeStep: React.FC<WeightRangeStepProps> = ({ onBack, onNext }) => {
  const { state, setWeightRange } = usePickupBooking();

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-140px)]">
      <div>
        {/* Header Title */}
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            What is the estimated weight of your scrap?
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Don't worry if it's not exact. Our executive will weigh everything accurately with certified scales.
          </p>
        </div>

        {/* Weight Range Options (Image 3 Screen 2) */}
        <div className="space-y-3 pb-6">
          {AVAILABLE_WEIGHT_RANGES.map((item, index) => {
            const isSelected = state.selectedWeightRangeId === item.id;
            return (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setWeightRange(item.id)}
                className={`p-4 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between shadow-xs ${
                  isSelected
                    ? 'border-[#0A3D2B] bg-emerald-50/70 shadow-sm ring-1 ring-[#0A3D2B]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Progressive Bag Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#0A3D2B] text-[#F59E0B]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {index === 4 ? (
                      <Package className="w-6 h-6 stroke-[2.2]" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
                    )}
                  </div>

                  <div>
                    <h3 className={`text-sm font-extrabold ${isSelected ? 'text-[#0A3D2B]' : 'text-slate-900'}`}>
                      {item.label}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.description} • <span className="font-semibold text-slate-700">{item.bags}</span>
                    </p>
                  </div>
                </div>

                {/* Radio Circle Indicator */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-[#0A3D2B] bg-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#0A3D2B]" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="pt-4 border-t border-slate-200/80">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full py-4 rounded-2xl bg-[#0A3D2B] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 hover:bg-[#0E4D36] flex items-center justify-center gap-2 transition-all"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </motion.button>
      </div>
    </div>
  );
};
