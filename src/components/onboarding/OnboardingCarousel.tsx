"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Scale, ShieldCheck, Sparkles, TrendingUp, CalendarCheck, Leaf, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface OnboardingCarouselProps {
  onComplete: () => void;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: Brand Splash & Mission
    {
      id: 1,
      badge: "REAL WEIGHT. REAL VALUE.",
      title: "Your Scrap Builds A Cleaner Tomorrow",
      subtitle: "Doorstep scrap collection with certified digital weighing and transparent market pricing.",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          {/* Glowing Green Backdrop Circle */}
          <div className="absolute w-56 h-56 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
          
          {/* Illustrated Scrap Truck & Scale Scene */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-48 h-32 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl shadow-2xl flex items-center justify-center p-4 border border-emerald-300/30 relative">
              {/* Truck Cab */}
              <div className="w-16 h-20 bg-emerald-700 rounded-2xl absolute -left-4 bottom-2 border border-emerald-400/40 flex flex-col items-center justify-center">
                <div className="w-10 h-6 bg-cyan-200/80 rounded-md mb-2" />
                <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-600" />
              </div>
              {/* Cargo Bed with Recyclables */}
              <div className="flex flex-col items-center ml-8">
                <Scale className="w-12 h-12 text-[#F59E0B] stroke-[2.5]" />
                <span className="text-[11px] font-black tracking-widest text-white mt-1">ASLI KAATA</span>
              </div>
              {/* Truck Wheels */}
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-600 absolute -bottom-3 right-6" />
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-600 absolute -bottom-3 right-24" />
            </div>
            {/* Eco Leaf Badge */}
            <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-emerald-900/60 rounded-full border border-emerald-500/40">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-200">100% Eco-Responsible Recycling</span>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 2: Transparent Scrap Prices
    {
      id: 2,
      badge: "TRANSPARENT PRICING",
      title: "Check Live Market Rates Before You Sell",
      subtitle: "Zero hidden cuts. Know exact market prices for metals, paper, plastics, and e-waste up front.",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="absolute w-52 h-52 rounded-full bg-amber-500/15 blur-2xl" />
          {/* Mock Phone Displaying Live Rates */}
          <div className="relative z-10 w-60 bg-white/95 text-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-[#0A3D2B] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Today's Rates
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">Live</span>
            </div>
            <div className="space-y-2 mt-2.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">📦</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Cardboard & Paper</p>
                    <p className="text-[10px] text-slate-500">Clean & dry</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#0A3D2B]">₹18 / kg</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚙️</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Iron & Metal</p>
                    <p className="text-[10px] text-slate-500">Heavy scrap</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#0A3D2B]">₹32 / kg</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">🍾</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">PET Plastic</p>
                    <p className="text-[10px] text-slate-500">Bottles & cans</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#0A3D2B]">₹28 / kg</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 3: Quick & Easy Pickup Scheduling
    {
      id: 3,
      badge: "EFFORTLESS BOOKING",
      title: "Schedule A Doorstep Pickup In 60 Seconds",
      subtitle: "Choose scrap categories, pick a convenient date & time slot, and our team arrives at your door.",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="absolute w-52 h-52 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="relative z-10 w-64 bg-white/95 text-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CalendarCheck className="w-4 h-4 text-[#0A3D2B]" />
              <span className="text-xs font-bold text-[#0A3D2B]">Easy Booking Steps</span>
            </div>
            <div className="space-y-2.5 mt-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</div>
                <span className="text-xs text-slate-700 font-medium">Select Scrap Categories</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</div>
                <span className="text-xs text-slate-700 font-medium">Choose Estimated Weight</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</div>
                <span className="text-xs text-slate-700 font-medium">Pick Date & Time Slot</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F59E0B] text-slate-900 text-xs font-bold flex items-center justify-center shrink-0">✓</div>
                <span className="text-xs text-slate-900 font-bold">Doorstep Pickup Confirmed</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 4: Verified Team at Your Doorstep
    {
      id: 4,
      badge: "VERIFIED & TRUSTED",
      title: "Digital Scales With Zero Weight Fraud",
      subtitle: "Our background-verified field executives carry certified Bluetooth digital weighing scales.",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="absolute w-52 h-52 rounded-full bg-teal-500/20 blur-2xl" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0A3D2B] flex items-center justify-center">
                <ShieldCheck className="w-12 h-12 text-[#F59E0B]" />
              </div>
            </div>
            <div className="mt-4 bg-white/95 text-slate-800 rounded-2xl px-5 py-3 shadow-xl border border-slate-200">
              <p className="text-xs font-black text-[#0A3D2B]">ISO Certified Digital Scales</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Real-time sync to your phone invoice</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full">
                <span>⚡ Instant UPI / Cash Payout</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 5: Greener Tomorrow & Get Started
    {
      id: 5,
      badge: "SUSTAINABILITY FIRST",
      title: "Building A Cleaner, Greener Tomorrow",
      subtitle: "Join thousands of conscious citizens turning household scrap into responsible green impact.",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="absolute w-56 h-56 rounded-full bg-emerald-500/25 blur-3xl animate-pulse" />
          <div className="relative z-10 w-full max-w-[280px] grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/95 rounded-2xl p-3 shadow-lg border border-slate-200 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1 text-base">🏠</div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Cleaner Homes</span>
            </div>
            <div className="bg-white/95 rounded-2xl p-3 shadow-lg border border-slate-200 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1 text-base">🌳</div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Greener Cities</span>
            </div>
            <div className="bg-white/95 rounded-2xl p-3 shadow-lg border border-slate-200 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1 text-base">🤝</div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Better Impact</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-[#0A3D2B] via-[#083324] to-[#041D14] text-white flex flex-col justify-between p-6 overflow-hidden select-none">
      {/* Top Bar: Logo & Skip Link */}
      <div className="flex items-center justify-between z-20 pt-2">
        <BrandLogo variant="light" size="sm" />

        {currentSlide < slides.length - 1 && (
          <button
            onClick={onComplete}
            className="text-xs font-semibold text-emerald-200 hover:text-white px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm transition-all"
          >
            Skip
          </button>
        )}
      </div>

      {/* Slide Content with Animated Transitions */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto z-10 w-full py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full flex flex-col items-center text-center"
          >
            {/* Illustration Slot */}
            <div className="w-full mb-6">
              {slides[currentSlide].illustration}
            </div>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[#F59E0B] text-[11px] font-bold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              {slides[currentSlide].badge}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-white leading-tight px-2 max-w-sm">
              {slides[currentSlide].title}
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-emerald-100/80 mt-2.5 px-4 leading-relaxed max-w-sm font-normal">
              {slides[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls: Pagination Dots & Action Buttons */}
      <div className="z-20 pb-safe pt-4">
        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? 'w-7 bg-[#F59E0B]'
                  : 'w-2 bg-emerald-700 hover:bg-emerald-600'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Button: Circular Arrow (Slides 1-4) or "Get Started" (Slide 5) */}
        {currentSlide < slides.length - 1 ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300/70 font-medium">
              Step {currentSlide + 1} of {slides.length}
            </span>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleNext}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 hover:brightness-105 transition-all"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-7 h-7 stroke-[3]" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onComplete}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 hover:brightness-105 transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </div>
    </div>
  );
};
