"use client";

import React from 'react';
import { MapPin, ChevronDown, Bell } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

interface TopAppBarProps {
  onNotificationClick?: () => void;
  unreadNotifications?: number;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onNotificationClick,
  unreadNotifications = 0,
}) => {
  const { location, openSheet } = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
      {/* Location Selector Pill */}
      <button
        onClick={openSheet}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/60 hover:bg-emerald-100/60 transition-all text-left max-w-[280px]"
      >
        <MapPin className="w-4 h-4 text-[#0A3D2B] shrink-0" />
        <div className="flex flex-col truncate">
          <span className="text-xs font-bold text-[#0A3D2B] truncate flex items-center gap-1">
            {location.areaName}
            <ChevronDown className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
          </span>
          <span className="text-[10px] text-slate-500 truncate -mt-0.5">
            {location.city} {location.pincode && `• ${location.pincode}`}
          </span>
        </div>
      </button>

      {/* Notifications Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#E11D48] rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
};
