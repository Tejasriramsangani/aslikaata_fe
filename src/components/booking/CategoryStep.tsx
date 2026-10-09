"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { usePickupBooking, AVAILABLE_CATEGORIES } from '../../context/PickupBookingContext';

interface CategoryStepProps {
  onBack: () => void;
  onNext: () => void;
}

export const CategoryStep: React.FC<CategoryStepProps> = ({ onBack, onNext }) => {
  const { state, toggleCategory } = usePickupBooking();

  const isAnySelected = state.selectedCategoryIds.length > 0;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-140px)]">
      <div>
        {/* Header Title */}
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            What type of scrap do you have?
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            You can select multiple categories for a single doorstep pickup.
          </p>
        </div>

        {/* 2-Column Categories Grid (Image 3 Screen 1) */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          {AVAILABLE_CATEGORIES.map((cat) => {
            const isSelected = state.selectedCategoryIds.includes(cat.id);
            return (
              <motion.div
                key={cat.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleCategory(cat.id)}
                className={`p-4 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between relative shadow-xs ${
                  isSelected
                    ? 'border-[#0A3D2B] bg-emerald-50/70 shadow-sm ring-1 ring-[#0A3D2B]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Selection Checkmark Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{cat.emoji}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#0A3D2B] text-white'
                        : 'border-2 border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h3 className={`text-sm font-extrabold ${isSelected ? 'text-[#0A3D2B]' : 'text-slate-900'}`}>
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    {cat.description}
                  </p>
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
          disabled={!isAnySelected}
          className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
            isAnySelected
              ? 'bg-[#0A3D2B] text-white shadow-emerald-950/20 hover:bg-[#0E4D36]'
              : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </motion.button>
      </div>
    </div>
  );
};
