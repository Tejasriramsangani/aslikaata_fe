"use client";

import React from 'react';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface TodayScrapRatesPreviewProps {
  onViewAll: () => void;
}

export const TODAY_RATES_DATA = [
  { id: '1', emoji: '📰', name: 'Newspaper', sub: 'Clean & dry', price: '₹18', unit: 'kg', trend: '+₹1.50', isUp: true, category: 'paper' },
  { id: '2', emoji: '📦', name: 'Cardboard', sub: 'Corrugated boxes', price: '₹14', unit: 'kg', trend: '+₹0.50', isUp: true, category: 'paper' },
  { id: '3', emoji: '🍾', name: 'PET Plastic', sub: 'Water & soda bottles', price: '₹28', unit: 'kg', trend: '-₹1.00', isUp: false, category: 'plastic' },
  { id: '4', emoji: '⚙️', name: 'Iron (Heavy)', sub: 'Steel & pipes', price: '₹32', unit: 'kg', trend: '+₹2.00', isUp: true, category: 'metal' },
  { id: '5', emoji: '🥫', name: 'Aluminium', sub: 'Cans & utensils', price: '₹125', unit: 'kg', trend: '+₹5.00', isUp: true, category: 'metal' },
  { id: '6', emoji: '🔌', name: 'Copper Wires', sub: 'Clean wires & coils', price: '₹480', unit: 'kg', trend: '+₹15.00', isUp: true, category: 'metal' },
  { id: '7', emoji: '💻', name: 'E-Waste', sub: 'CPUs, motherboards', price: '₹85', unit: 'kg', trend: '+₹0.00', isUp: true, category: 'ewaste' },
];

export const TodayScrapRatesPreview: React.FC<TodayScrapRatesPreviewProps> = ({
  onViewAll,
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 leading-tight">Today's Scrap Rates</h3>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live market pricing
            </span>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 bg-emerald-50 px-2.5 py-1 rounded-full transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
        </button>
      </div>

      {/* Horizontal Scrolling Rate Cards */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
        {TODAY_RATES_DATA.map((item) => (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.96 }}
            onClick={onViewAll}
            className="min-w-[115px] p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all flex flex-col items-center text-center shrink-0 cursor-pointer shadow-xs"
          >
            <span className="text-2xl mb-1">{item.emoji}</span>
            <p className="text-[11px] font-extrabold text-slate-800 truncate w-full">
              {item.name}
            </p>
            <p className="text-xs font-black text-[#0A3D2B] mt-0.5">
              {item.price}
              <span className="text-[9px] font-normal text-slate-500">/{item.unit}</span>
            </p>
            <span
              className={`text-[9px] font-bold mt-1 px-1.5 py-0.2 rounded-md ${
                item.isUp
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {item.isUp ? '⬆' : '⬇'} {item.trend}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
