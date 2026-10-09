"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Calendar, 
  MapPin, 
  Scale, 
  Banknote, 
  ArrowRight, 
  Sparkles,
  Tag
} from 'lucide-react';
import { usePickupBooking, AVAILABLE_CATEGORIES, AVAILABLE_WEIGHT_RANGES, AVAILABLE_TIME_SLOTS } from '../../context/PickupBookingContext';
import { useLocation } from '../../context/LocationContext';

interface BookingSuccessStepProps {
  onGoToPickups: (pickup?: any) => void;
  onGoToHome: () => void;
}

export const BookingSuccessStep: React.FC<BookingSuccessStepProps> = ({
  onGoToPickups,
  onGoToHome,
}) => {
  const { state, resetBooking } = usePickupBooking();
  const { location } = useLocation();

  const selectedCategories = AVAILABLE_CATEGORIES.filter((c) =>
    state.selectedCategoryIds.includes(c.id)
  );

  const selectedWeight = AVAILABLE_WEIGHT_RANGES.find(
    (w) => w.id === state.selectedWeightRangeId
  );

  const selectedSlot = AVAILABLE_TIME_SLOTS.find(
    (s) => s.id === state.selectedSlotId
  );

  const pickupCode = state.confirmedPickup?.pickupCode || `AKP-${Math.floor(10000 + Math.random() * 90000)}`;

  // Format Scheduled Date
  const formattedDate = (() => {
    if (!state.selectedDate) return 'Upcoming';
    try {
      const d = new Date(state.selectedDate);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return state.selectedDate;
    }
  })();

  const handlePickupsClick = () => {
    const pickupData = state.confirmedPickup;
    resetBooking();
    onGoToPickups(pickupData);
  };

  const handleHomeClick = () => {
    resetBooking();
    onGoToHome();
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-140px)] pb-2 animate-in fade-in duration-300">
      <div className="space-y-5">
        {/* Top Celebratory Hero (Image 3 Screen 5) */}
        <div className="relative pt-4 pb-2 flex flex-col items-center text-center">
          {/* Glowing Checkmark Badge with Confetti Sparkles */}
          <div className="relative mb-3">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 rounded-full bg-[#0A3D2B] text-white flex items-center justify-center shadow-xl shadow-emerald-950/25 border-4 border-emerald-100 relative z-10"
            >
              <Check className="w-10 h-10 stroke-[3.5] text-[#22C55E]" />
            </motion.div>

            {/* Radiant pulse rings */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping -z-0" />

            {/* Confetti / Sparkle accents */}
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-2 -right-3 text-amber-400 text-xl font-bold"
            >
              ✨
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-3 -left-3 text-amber-500 text-lg font-bold"
            >
              🎉
            </motion.span>
          </div>

          {/* Electric Scrap Truck Graphic */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full max-w-[280px] h-28 my-1 relative flex items-center justify-center bg-gradient-to-b from-emerald-50/80 to-transparent rounded-3xl p-2 border border-emerald-100/60"
          >
            {/* Eco City & Tree Background Silhouette */}
            <div className="absolute inset-x-4 bottom-2 h-10 bg-emerald-100/40 rounded-b-2xl -z-0 flex items-end justify-between px-3 pb-1">
              <span className="text-sm opacity-60">🌳</span>
              <span className="text-xs opacity-40">🏙️</span>
              <span className="text-sm opacity-60">🌲</span>
              <span className="text-xs opacity-40">🏢</span>
              <span className="text-sm opacity-60">🌳</span>
            </div>

            {/* EV Truck Illustration */}
            <div className="relative z-10 flex items-center">
              <div className="flex items-center">
                {/* Truck Cargo Box */}
                <div className="w-28 h-16 bg-[#0A3D2B] rounded-l-xl rounded-tr-sm p-1.5 flex flex-col justify-between border-y-2 border-l-2 border-emerald-700 shadow-md relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black tracking-widest text-[#F59E0B] uppercase">ASLI KAATA</span>
                    <span className="text-[10px]">♻️</span>
                  </div>
                  <div className="text-[7px] text-emerald-200 font-semibold leading-tight">
                    DOORSTEP SCRAP
                  </div>
                  <div className="h-1 w-full bg-emerald-600 rounded-full" />
                </div>

                {/* Truck Cabin */}
                <div className="w-14 h-14 bg-amber-400 rounded-r-2xl rounded-tr-lg border-2 border-amber-500 flex flex-col justify-between p-1 shadow-md relative -ml-0.5">
                  <div className="w-6 h-5 bg-sky-200 rounded-sm border border-sky-400 self-end mr-0.5" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-200 self-end mr-0.5 border border-amber-600" />
                </div>
              </div>

              {/* Wheels */}
              <div className="absolute -bottom-2 left-5 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-300 flex items-center justify-center shadow">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              <div className="absolute -bottom-2 right-6 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-300 flex items-center justify-center shadow">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
            </div>
          </motion.div>

          {/* Headline & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2"
          >
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Pickup successfully requested!
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-[290px] mx-auto leading-relaxed">
              We'll notify you once an employee is assigned for your pickup.
            </p>
          </motion.div>
        </div>

        {/* Request Summary Card (Image 3 Screen 5) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
              Request Summary
            </h3>
            <span className="text-[11px] font-black text-[#0A3D2B] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              #{pickupCode}
            </span>
          </div>

          {/* Row 1: Date & Time */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">
                {formattedDate}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedSlot?.displayLabel || '9:00 AM – 11:00 AM'}
              </p>
            </div>
          </div>

          {/* Row 2: Location */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">
                {location.areaName}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {location.formattedAddress}
              </p>
            </div>
          </div>

          {/* Row 3: Categories */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {selectedCategories.map((c) => (
                  <span
                    key={c.id}
                    className="text-[10px] font-extrabold text-[#0A3D2B] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80"
                  >
                    {c.emoji} {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Weight */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">
                {selectedWeight?.label || '0 – 10 kg'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedWeight?.description} ({selectedWeight?.bags})
              </p>
            </div>
          </div>

          {/* Row 5: Payment Preference */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">
                {state.paymentPreference === 'CASH' ? 'Cash (Pay on pickup)' : 'Instant UPI'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Instant settlement after digital scale weighing
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky Bottom Actions (Image 3 Screen 5) */}
      <div className="pt-4 space-y-2.5 border-t border-slate-200/80">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePickupsClick}
          className="w-full py-4 rounded-2xl bg-[#0A3D2B] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 hover:bg-[#0E4D36] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Go to My Pickups</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleHomeClick}
          className="w-full py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 text-center transition-all cursor-pointer"
        >
          Go to Home
        </motion.button>
      </div>
    </div>
  );
};
