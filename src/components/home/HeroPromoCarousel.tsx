"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Truck, Scale, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface HeroPromoCarouselProps {
  areaName: string;
  onBookPickup: () => void;
}

export const HeroPromoCarousel: React.FC<HeroPromoCarouselProps> = ({
  areaName,
  onBookPickup,
}) => {
  const [activeBanner, setActiveBanner] = useState(0);

  const banners = [
    {
      id: 1,
      badge: "REAL WEIGHT. REAL VALUE.",
      headline: "Turn Your Scrap Into Real Value",
      subtext: `Book certified doorstep scrap pickup in ${areaName} with live market rates.`,
      cta: "Book a Pickup",
      icon: <Truck className="w-36 h-36 text-emerald-400 stroke-[1]" />,
    },
    {
      id: 2,
      badge: "DIGITAL PRECISION",
      headline: "Zero Weight Fraud Guarantee",
      subtext: "ISO certified Bluetooth weighing scales with digital receipt generated on the spot.",
      cta: "Schedule Now",
      icon: <Scale className="w-36 h-36 text-amber-400 stroke-[1]" />,
    },
    {
      id: 3,
      badge: "INSTANT SETTLEMENT",
      headline: "Cash or Direct UPI Payout",
      subtext: "Receive money in your hand or UPI account the instant your scrap is weighed.",
      cta: "Sell Scrap Today",
      icon: <ShieldCheck className="w-36 h-36 text-teal-300 stroke-[1]" />,
    },
  ];

  // Auto-advance banner every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-r from-[#0A3D2B] via-[#0E4D36] to-[#083324] text-white p-5 shadow-xl overflow-hidden">
      {/* Ambient Radial Highlights */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeBanner}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 max-w-[240px]"
        >
          {/* Brand Logo in Banner */}
          <div className="mb-2.5">
            <BrandLogo variant="light" size="sm" />
          </div>

          {/* Headline */}
          <h2 className="text-xl font-extrabold leading-tight">
            {banners[activeBanner].headline}
          </h2>

          {/* Subtext */}
          <p className="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">
            {banners[activeBanner].subtext}
          </p>

          {/* CTA Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBookPickup}
            className="mt-3.5 px-4 py-2 rounded-xl bg-[#F59E0B] text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 flex items-center gap-1.5 hover:brightness-105 transition-all"
          >
            <span>{banners[activeBanner].cta}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* Decorative SVG Graphic */}
      <div className="absolute -right-6 -bottom-4 opacity-30 pointer-events-none">
        {banners[activeBanner].icon}
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-20">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveBanner(idx)}
            className={`h-1.5 rounded-full transition-all ${
              activeBanner === idx ? 'w-5 bg-[#F59E0B]' : 'w-1.5 bg-emerald-800'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
