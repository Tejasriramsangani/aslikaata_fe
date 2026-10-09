"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Crosshair, Search, MapPin, Truck, Trees } from 'lucide-react';
import { useLocation, LocationData } from '../../context/LocationContext';
import { LocationBottomSheetModal } from './LocationBottomSheetModal';
import { BrandLogo } from '../common/BrandLogo';

interface LocationPermissionScreenProps {
  onLocationConfirmed: (location: LocationData) => void;
}

export const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({
  onLocationConfirmed,
}) => {
  const { location, requestCurrentLocation } = useLocation();
  const [isManualSheetOpen, setIsManualSheetOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleAllowLocation = async () => {
    setIsLocating(true);
    const success = await requestCurrentLocation();
    setIsLocating(false);
    if (success) {
      onLocationConfirmed(location);
    } else {
      // If permission is denied or unavailable, fall back to opening manual selection
      setIsManualSheetOpen(true);
    }
  };

  const handleManualSelection = (selectedLoc: LocationData) => {
    setIsManualSheetOpen(false);
    onLocationConfirmed(selectedLoc);
  };

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-white flex flex-col justify-between p-6 overflow-hidden">
      {/* Top Header Logo */}
      <div className="flex flex-col items-center pt-4">
        <BrandLogo size="lg" />
      </div>

      {/* Center Illustration Scene */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-[280px] h-60 flex items-center justify-center mb-6"
        >
          {/* Ambient Glow */}
          <div className="absolute w-52 h-52 rounded-full bg-emerald-200/50 blur-3xl" />

          {/* Map Pin Floating Above Truck Illustration */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated Pin */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-14 h-14 rounded-full bg-[#0A3D2B] text-white flex items-center justify-center shadow-xl shadow-emerald-900/30 border-2 border-emerald-300/40 relative z-20 -mb-4"
            >
              <MapPin className="w-7 h-7 text-[#F59E0B] fill-[#F59E0B]/20" />
            </motion.div>

            {/* Road & Truck Platform */}
            <div className="w-56 h-32 rounded-3xl bg-gradient-to-tr from-emerald-800 to-teal-700 shadow-2xl p-4 flex flex-col items-center justify-center border border-emerald-500/30 relative">
              {/* City Skyline Outline & Trees */}
              <div className="absolute top-2 left-3 right-3 flex justify-between opacity-30 text-emerald-200">
                <Trees className="w-5 h-5" />
                <Trees className="w-4 h-4" />
                <Trees className="w-5 h-5" />
              </div>

              {/* Truck Graphic */}
              <div className="flex items-center gap-2 mt-4 text-white">
                <Truck className="w-10 h-10 text-emerald-200" />
                <div className="text-left">
                  <span className="text-[11px] font-black tracking-wider block">DOORSTEP PICKUP</span>
                  <span className="text-[9px] text-emerald-200 block">Vijayawada Hub</span>
                </div>
              </div>
            </div>

            {/* Subtle shadow beneath */}
            <div className="w-40 h-3 rounded-full bg-slate-300/60 blur-sm mt-2" />
          </div>
        </motion.div>

        {/* Text Details */}
        <h2 className="text-xl font-extrabold text-slate-900 leading-tight px-4 max-w-sm">
          Set your location to get started
        </h2>
        <p className="text-xs text-slate-600 mt-2.5 px-6 leading-relaxed max-w-sm">
          Allow your location or enter it manually to find the best scrap pickup service available near you in Vijayawada.
        </p>
      </div>

      {/* Bottom Action Buttons */}
      <div className="space-y-3 pb-safe pt-2">
        {/* Primary CTA: Allow Current Location */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAllowLocation}
          disabled={isLocating}
          className="w-full py-4 rounded-2xl bg-[#0A3D2B] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2.5 hover:bg-[#0E4D36] transition-all"
        >
          <Crosshair className={`w-4 h-4 text-[#F59E0B] ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? "Detecting GPS Location..." : "Allow Current Location"}</span>
        </motion.button>

        {/* Secondary CTA: Enter Location Manually */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsManualSheetOpen(true)}
          className="w-full py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-sm shadow-sm flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-all"
        >
          <Search className="w-4 h-4 text-slate-600" />
          <span>Enter Location Manually</span>
        </motion.button>

        {/* Service coverage disclaimer */}
        <p className="text-center text-[10px] text-slate-400 pt-1">
          📍 Active service across Vijayawada & surrounding AP regions
        </p>
      </div>

      {/* Manual Locality Selection Bottom Sheet Modal */}
      <LocationBottomSheetModal
        isOpen={isManualSheetOpen}
        onClose={() => setIsManualSheetOpen(false)}
        onSelectLocation={handleManualSelection}
      />
    </div>
  );
};
