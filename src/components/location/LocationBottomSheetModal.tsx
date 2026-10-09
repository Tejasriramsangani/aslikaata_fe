"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MapPin, Crosshair, History, Check } from 'lucide-react';
import { useLocation, LocationData } from '../../context/LocationContext';

interface LocationBottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (location: LocationData) => void;
}

const POPULAR_LOCALITIES: LocationData[] = [
  {
    areaName: "Satyanarayanapuram",
    city: "Vijayawada",
    pincode: "520011",
    formattedAddress: "Satyanarayanapuram, Vijayawada, AP - 520011",
  },
  {
    areaName: "Benz Circle",
    city: "Vijayawada",
    pincode: "520010",
    formattedAddress: "Benz Circle, MG Road, Vijayawada, AP - 520010",
  },
  {
    areaName: "Moghalrajpuram",
    city: "Vijayawada",
    pincode: "520010",
    formattedAddress: "Moghalrajpuram, Siddhartha College Area, Vijayawada, AP - 520010",
  },
  {
    areaName: "Governorpet",
    city: "Vijayawada",
    pincode: "520002",
    formattedAddress: "Governorpet, Commercial District, Vijayawada, AP - 520002",
  },
  {
    areaName: "Bhavanipuram",
    city: "Vijayawada",
    pincode: "520012",
    formattedAddress: "Bhavanipuram, National Highway, Vijayawada, AP - 520012",
  },
  {
    areaName: "Patamata",
    city: "Vijayawada",
    pincode: "520014",
    formattedAddress: "Patamata, High School Road, Vijayawada, AP - 520014",
  },
  {
    areaName: "Auto Nagar",
    city: "Vijayawada",
    pincode: "520007",
    formattedAddress: "Auto Nagar Industrial Hub, Vijayawada, AP - 520007",
  },
  {
    areaName: "One Town",
    city: "Vijayawada",
    pincode: "520001",
    formattedAddress: "One Town, Temple Road, Vijayawada, AP - 520001",
  },
];

export const LocationBottomSheetModal: React.FC<LocationBottomSheetModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const { location, setLocation, requestCurrentLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const filteredLocalities = useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_LOCALITIES;
    const query = searchQuery.toLowerCase();
    return POPULAR_LOCALITIES.filter(
      (loc) =>
        loc.areaName.toLowerCase().includes(query) ||
        loc.pincode.includes(query) ||
        loc.formattedAddress.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (loc: LocationData) => {
    setLocation(loc);
    if (onSelectLocation) onSelectLocation(loc);
    onClose();
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    const success = await requestCurrentLocation();
    setIsLocating(false);
    if (success) {
      if (onSelectLocation) {
        onSelectLocation(location);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Bottom Sheet Modal Container */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-t-[32px] shadow-2xl p-6 pb-safe z-10 max-h-[85vh] flex flex-col border-t border-slate-200"
        >
          {/* Top Sheet Drag Grabber Handle */}
          <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto -mt-1 mb-4" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Select Your Location</h2>
              <p className="text-xs text-slate-500">Pick your scrap collection locality in Vijayawada</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box Input */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area, street name or pincode..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D2B] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Use Current GPS Location Action */}
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="mt-3 w-full p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-3 text-left hover:bg-emerald-100/70 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Crosshair className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex-1 truncate">
              <span className="text-xs font-bold text-[#0A3D2B] block">
                {isLocating ? "Detecting GPS location..." : "Use current location"}
              </span>
              <span className="text-[10px] text-emerald-700">Find the nearest scrap pickup service</span>
            </div>
          </button>

          {/* Scrollable Location List */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-4 no-scrollbar pr-1">
            {/* Recent Selection */}
            {!searchQuery && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <History className="w-3.5 h-3.5" />
                  Recent Location
                </div>
                <div
                  onClick={() => handleSelect(location)}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#0A3D2B] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{location.areaName}</p>
                      <p className="text-[10px] text-slate-500">{location.formattedAddress}</p>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </div>
              </div>
            )}

            {/* Popular Localities in Vijayawada */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {searchQuery ? "Search Results" : "Available Localities in Vijayawada"}
              </div>
              <div className="space-y-1.5">
                {filteredLocalities.map((loc, idx) => {
                  const isSelected = location.areaName === loc.areaName;
                  return (
                    <motion.div
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(loc)}
                      className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-[#0A3D2B]' : 'text-slate-800'}`}>
                            {loc.areaName}
                          </p>
                          <p className="text-[10px] text-slate-500">{loc.formattedAddress}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </motion.div>
                  );
                })}

                {filteredLocalities.length === 0 && (
                  <div className="text-center py-6 text-slate-400">
                    <p className="text-xs">No locality found matching "{searchQuery}"</p>
                    <p className="text-[10px] text-slate-400 mt-1">Please select an area within Vijayawada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
