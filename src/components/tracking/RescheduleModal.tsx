"use client";

import React, { useState } from 'react';
import { Calendar, Clock, X, Check } from 'lucide-react';
import { AVAILABLE_TIME_SLOTS, TimeSlotItem } from '../../context/PickupBookingContext';

interface RescheduleModalProps {
  isOpen: boolean;
  currentDate: string;
  currentSlotId?: string;
  onClose: () => void;
  onConfirmReschedule: (newDate: string, newSlotId?: string, reason?: string) => Promise<void>;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  currentDate,
  currentSlotId,
  onClose,
  onConfirmReschedule,
}) => {
  // Generate next 7 days starting from tomorrow
  const availableDates = React.useMemo(() => {
    const list = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const day = d.getDate();
      const month = d.toLocaleDateString('en-IN', { month: 'short' });
      list.push({ iso, weekday, day, month });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState(availableDates[0]?.iso || currentDate);
  const [selectedSlotId, setSelectedSlotId] = useState(currentSlotId || AVAILABLE_TIME_SLOTS[0].id);
  const [reason, setReason] = useState('Change of schedule');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmReschedule(selectedDate, selectedSlotId, reason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Calendar className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Reschedule Pickup</h3>
              <p className="text-[10px] text-slate-400">Choose a new date and time slot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto my-3 space-y-4 flex-1 pr-1">
          {/* 1. Date Selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 mb-2 block">
              Select New Date
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.iso;
                return (
                  <button
                    key={item.iso}
                    onClick={() => setSelectedDate(item.iso)}
                    className={`shrink-0 flex flex-col items-center justify-center w-15 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0A3D2B] bg-[#0A3D2B] text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase opacity-80">
                      {item.weekday}
                    </span>
                    <span className="text-base font-black my-0.5">{item.day}</span>
                    <span className="text-[10px] font-semibold">{item.month}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Slot Selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 mb-2 block">
              Select Time Slot
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {AVAILABLE_TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0A3D2B] bg-emerald-50/70 text-[#0A3D2B]'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4" />
                      <div>
                        <p className="text-xs font-bold">{slot.displayLabel}</p>
                        <p className="text-[10px] opacity-75 capitalize">{slot.period} slot</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#0A3D2B] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Reason Dropdown */}
          <div>
            <label className="text-xs font-bold text-slate-800 mb-1.5 block">
              Reason for Rescheduling
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:border-[#0A3D2B]"
            >
              <option value="Change of schedule">Change of personal schedule</option>
              <option value="Not available at home">Not available at home</option>
              <option value="More scrap to accumulate">Accumulating more scrap</option>
              <option value="Preferred different time">Preferred a different time window</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-[#0A3D2B] hover:bg-[#06291C] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? 'Saving...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
};
