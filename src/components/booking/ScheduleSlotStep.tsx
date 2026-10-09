"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sun, CloudSun, Moon, Calendar, MapPin, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { usePickupBooking, AVAILABLE_TIME_SLOTS } from '../../context/PickupBookingContext';
import { useLocation } from '../../context/LocationContext';
import { apiClient } from '../../lib/api-client';

interface ScheduleSlotStepProps {
  onBack: () => void;
  onNext: () => void;
}

interface RouteDateItem {
  iso: string;
  weekday: string;
  dayNum: number;
  monthStr: string;
  windowLabel: string;
  startTime: string;
  endTime: string;
  routeScheduleId?: string;
}

export const ScheduleSlotStep: React.FC<ScheduleSlotStepProps> = ({ onBack, onNext }) => {
  const { state, setDate, setSlot } = usePickupBooking();
  const { location } = useLocation();

  const [loading, setLoading] = useState(false);
  const [availabilityMode, setAvailabilityMode] = useState<'SLOTS' | 'ROUTE_DAYS'>('SLOTS');
  const [helperText, setHelperText] = useState<string>('');
  const [routeDates, setRouteDates] = useState<RouteDateItem[]>([]);
  const [outOfCoverage, setOutOfCoverage] = useState(false);

  // Fetch dynamic availability from backend
  useEffect(() => {
    let isMounted = true;

    async function fetchAvailability() {
      setLoading(true);
      try {
        let addressId = state.addressId;
        if (!addressId || !/^[0-9a-fA-F]{24}$/.test(addressId)) {
          try {
            const addrRes = await apiClient.get<any[]>('/customer/addresses');
            if (addrRes.success && Array.isArray(addrRes.data) && addrRes.data.length > 0) {
              addressId = addrRes.data[0]._id || addrRes.data[0].id;
            }
          } catch {}
        }
        const weightRangeId = state.selectedWeightRangeId || 'wr_10_20';

        const res = await apiClient.get<any>(
          `/availability?addressId=${encodeURIComponent(addressId || '')}&weightRangeId=${encodeURIComponent(weightRangeId)}`,
        );

        if (isMounted && res.success && res.data) {
          const data = res.data;
          setAvailabilityMode(data.mode);
          setHelperText(data.helperText || '');
          setOutOfCoverage(!!data.outOfCoverage);

          if (data.mode === 'ROUTE_DAYS' && data.routeDaysMode?.dates) {
            setRouteDates(data.routeDaysMode.dates);
            if (data.routeDaysMode.dates.length > 0 && !state.selectedDate) {
              setDate(data.routeDaysMode.dates[0].iso);
            }
          }
        }
      } catch {
        // Fallback gracefully to standard SLOTS mode
        if (isMounted) {
          setAvailabilityMode('SLOTS');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAvailability();
    return () => {
      isMounted = false;
    };
  }, [state.selectedWeightRangeId, state.addressId]);

  // Generate 7 dates for standard SLOTS mode
  const defaultDateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekday;
      dates.push({
        iso,
        label,
        dayNum,
        monthStr,
        weekday,
      });
    }
    return dates;
  }, []);

  // Time Slots grouped by period
  const morningSlots = AVAILABLE_TIME_SLOTS.filter((s) => s.period === 'morning');
  const afternoonSlots = AVAILABLE_TIME_SLOTS.filter((s) => s.period === 'afternoon');
  const eveningSlots = AVAILABLE_TIME_SLOTS.filter((s) => s.period === 'evening');

  const isContinueEnabled = Boolean(
    state.selectedDate && (availabilityMode === 'ROUTE_DAYS' || state.selectedSlotId),
  );

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-140px)]">
      <div className="space-y-5 pb-6">
        {/* Header Title */}
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            When would you like us to pick it up?
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {availabilityMode === 'ROUTE_DAYS'
              ? 'Select your preferred collection date for your area.'
              : 'Choose your preferred date and convenient time window.'}
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0A3D2B]" />
            <span className="text-xs font-semibold">Checking area schedule...</span>
          </div>
        ) : availabilityMode === 'ROUTE_DAYS' ? (
          /* ========================================================= */
          /* MODE 2: ROUTE_DAYS (Area Collection Days with Holiday Shift) */
          /* ========================================================= */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Helper Banner (Notice: Zero mention of "bulk" or "weekly") */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#0A3D2B] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#0A3D2B]">
                  {helperText || `We collect from ${location.areaName || 'your area'} on these days.`}
                </p>
                <p className="text-[11px] text-emerald-800/80 mt-0.5">
                  Pick a convenient day. Our collection vehicle will visit during the scheduled window.
                </p>
              </div>
            </div>

            {/* Area Collection Dates */}
            {routeDates.length > 0 ? (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 block px-0.5">
                  Upcoming Collection Days
                </label>
                {routeDates.map((item) => {
                  const isSelected = state.selectedDate === item.iso;
                  return (
                    <motion.div
                      key={item.iso}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDate(item.iso)}
                      className={`p-4 rounded-3xl border-2 flex items-center justify-between cursor-pointer transition-all shadow-xs ${
                        isSelected
                          ? 'border-[#0A3D2B] bg-emerald-50/70 shadow-sm ring-1 ring-[#0A3D2B]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#0A3D2B] text-white shadow-md'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                            {item.weekday}
                          </span>
                          <span className="text-base font-black my-0.5 leading-none">
                            {item.dayNum}
                          </span>
                          <span className="text-[9px] font-medium leading-none opacity-80">
                            {item.monthStr}
                          </span>
                        </div>

                        <div>
                          <h4 className={`text-xs font-extrabold ${isSelected ? 'text-[#0A3D2B]' : 'text-slate-900'}`}>
                            {item.weekday}, {item.dayNum} {item.monthStr}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                            Collection Window: <span className="font-bold text-slate-700">{item.windowLabel}</span>
                          </p>
                        </div>
                      </div>

                      {/* Radio Circle */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-[#0A3D2B] bg-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#0A3D2B]" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : outOfCoverage ? (
              <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-700 mx-auto" />
                <h4 className="text-xs font-extrabold text-amber-900">Coverage Note</h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  We will confirm a collection day for your area shortly. You can proceed with your request, and our operations team will coordinate your pickup.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          /* ========================================================= */
          /* MODE 1: SLOTS (Date strip + Morning / Afternoon / Evening) */
          /* ========================================================= */
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Horizontal Date Picker Cards (Image 3 Screen 3) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 px-0.5">
                Select Pickup Date
              </label>
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
                {defaultDateOptions.map((item) => {
                  const isSelected = state.selectedDate === item.iso;
                  return (
                    <motion.div
                      key={item.iso}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDate(item.iso)}
                      className={`min-w-[76px] py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all shadow-xs ${
                        isSelected
                          ? 'border-[#0A3D2B] bg-[#0A3D2B] text-white shadow-md shadow-emerald-950/20'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#F59E0B]' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                      <span className="text-lg font-black my-0.5 leading-none">
                        {item.dayNum}
                      </span>
                      <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {item.monthStr}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Time Slots Grouped by Period (Image 3 Screen 3) */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 block px-0.5 -mb-2">
                Select Time Slot
              </label>

              {/* Morning Slots */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-700">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Morning Slots</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {morningSlots.map((slot) => {
                    const isSelected = state.selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSlot(slot.id)}
                        className={`py-3 px-3 rounded-2xl border-2 text-xs font-bold transition-all text-center ${
                          isSelected
                            ? 'border-[#0A3D2B] bg-[#0A3D2B] text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {slot.displayLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Afternoon Slots */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800">
                  <CloudSun className="w-3.5 h-3.5" />
                  <span>Afternoon Slots</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {afternoonSlots.map((slot) => {
                    const isSelected = state.selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSlot(slot.id)}
                        className={`py-3 px-3 rounded-2xl border-2 text-xs font-bold transition-all text-center ${
                          isSelected
                            ? 'border-[#0A3D2B] bg-[#0A3D2B] text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {slot.displayLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evening Slots */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-950">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Evening Slots</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {eveningSlots.map((slot) => {
                    const isSelected = state.selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSlot(slot.id)}
                        className={`py-3 px-3 rounded-2xl border-2 text-xs font-bold transition-all text-center ${
                          isSelected
                            ? 'border-[#0A3D2B] bg-[#0A3D2B] text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {slot.displayLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="pt-4 border-t border-slate-200/80">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={!isContinueEnabled}
          className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
            isContinueEnabled
              ? 'bg-[#0A3D2B] text-white shadow-emerald-950/20 hover:bg-[#0E4D36] cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </motion.button>
      </div>
    </div>
  );
};
