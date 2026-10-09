"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Package } from 'lucide-react';

interface BulkDisposalCardProps {
  onBookBulk: () => void;
}

export const BulkDisposalCard: React.FC<BulkDisposalCardProps> = ({ onBookBulk }) => {
  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-r from-[#062418] via-[#0A3D2B] to-[#041D14] text-white p-5 shadow-lg border border-emerald-900/60 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-[240px]">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#F59E0B] text-[9px] font-black uppercase tracking-wider mb-2">
          <Building2 className="w-3 h-3 text-[#F59E0B]" />
          Bulk & Commercial Disposal
        </span>

        <h3 className="text-base font-extrabold text-white leading-tight">
          Need to dispose a large amount of scrap?
        </h3>

        <p className="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">
          Book dedicated pickup for apartments, societies, offices, or factories with commercial volume rates.
        </p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBookBulk}
          className="mt-3.5 px-4 py-2 rounded-xl bg-[#F59E0B] text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 hover:brightness-105 transition-all"
        >
          <span>Book Bulk Pickup</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </motion.button>
      </div>

      {/* Decorative Package Boxes Graphic */}
      <div className="absolute -right-4 -bottom-3 opacity-25 pointer-events-none">
        <Package className="w-32 h-32 text-emerald-300 stroke-[1]" />
      </div>
    </div>
  );
};
