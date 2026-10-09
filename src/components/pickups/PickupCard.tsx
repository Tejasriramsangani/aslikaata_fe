"use client";

import React from 'react';
import { Clock, MapPin, ChevronRight, User, Check, X, Calendar } from 'lucide-react';

export interface PickupItemData {
  _id?: string;
  id?: string;
  pickupCode: string;
  status:
    | 'REQUESTED'
    | 'SCHEDULED'
    | 'ASSIGNED'
    | 'ON_THE_WAY'
    | 'ARRIVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'SETTLED'
    | 'CANCELLED'
    | 'FAILED'
    | string;
  scheduledDate: string; // YYYY-MM-DD or formatted
  timeSlotSnapshot?: {
    displayLabel: string;
    startTime?: string;
    endTime?: string;
  };
  addressSnapshot?: {
    line1?: string;
    city?: string;
    landmark?: string | null;
  };
  locationLabel?: string;
  categories?: any[];
  assignment?: {
    employeeName?: string;
    employeeCode?: string;
  };
  totals?: {
    netWeightGrams?: number;
    totalAmount?: number;
  };
}

interface PickupCardProps {
  pickup: PickupItemData;
  onClick: () => void;
}

export const PickupCard: React.FC<PickupCardProps> = ({ pickup, onClick }) => {
  // Parse date into day, monthYear, and weekday
  const { day, monthYear, weekday } = React.useMemo(() => {
    try {
      const d = new Date(pickup.scheduledDate);
      if (isNaN(d.getTime())) {
        // Fallback for custom formatted strings
        return { day: '04', monthYear: 'Oct 2026', weekday: 'Sat' };
      }
      return {
        day: d.getDate().toString().padStart(2, '0'),
        monthYear: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      };
    } catch {
      return { day: '04', monthYear: 'Oct 2026', weekday: 'Sat' };
    }
  }, [pickup.scheduledDate]);

  const isCancelled = pickup.status === 'CANCELLED' || pickup.status === 'FAILED';
  const isCompleted = pickup.status === 'COMPLETED' || pickup.status === 'SETTLED';

  // Render status badge matching Image 5
  const renderStatusBadge = () => {
    switch (pickup.status) {
      case 'ASSIGNED':
      case 'ON_THE_WAY':
      case 'ARRIVED':
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            <User className="w-3 h-3 stroke-[2.5]" />
            <span>Employee Assigned</span>
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <Calendar className="w-3 h-3 stroke-[2.5]" />
            <span>Scheduled</span>
          </span>
        );
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 stroke-[2.5]" />
            <span>Requested</span>
          </span>
        );
      case 'COMPLETED':
      case 'SETTLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>Completed</span>
          </span>
        );
      case 'CANCELLED':
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
            <X className="w-3 h-3 stroke-[3]" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {pickup.status}
          </span>
        );
    }
  };

  const locationText =
    pickup.locationLabel ||
    (pickup.addressSnapshot
      ? `${pickup.addressSnapshot.line1 || 'Madhura Nagar'}, ${pickup.addressSnapshot.city || 'Vijayawada'}`
      : 'Madhura Nagar, Vijayawada');

  const slotText = pickup.timeSlotSnapshot?.displayLabel || '9:00 AM – 11:00 AM';

  return (
    <div
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between gap-3 group"
    >
      {/* Left Date Badge (Image 5) */}
      <div
        className={`w-16 h-18 rounded-xl flex flex-col items-center justify-center shrink-0 border transition-colors ${
          isCancelled
            ? 'bg-[#FFF1F2] border-[#FFE4E6] text-[#BE123C]'
            : 'bg-[#F0FDF4] border-[#DCFCE7] text-[#0A3D2B]'
        }`}
      >
        <span className="text-xl font-black leading-none mb-0.5">{day}</span>
        <span className="text-[10px] font-bold opacity-80 leading-tight">{monthYear}</span>
        <span className="text-[10px] font-semibold opacity-70 leading-tight">{weekday}</span>
      </div>

      {/* Middle Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <h3 className="text-sm font-black text-slate-900 tracking-tight truncate">
            {pickup.pickupCode}
          </h3>
          {renderStatusBadge()}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{slotText}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        </div>
      </div>

      {/* Right Navigation Arrow */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0">
        <ChevronRight className="w-5 h-5 stroke-[2.2]" />
      </div>
    </div>
  );
};
