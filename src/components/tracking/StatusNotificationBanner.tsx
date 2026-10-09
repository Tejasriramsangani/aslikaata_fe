"use client";

import React from 'react';
import { Clock, CalendarCheck, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PickupLifecycleStatus } from './LifecycleStepper';

interface StatusNotificationBannerProps {
  status: PickupLifecycleStatus | string;
}

export const StatusNotificationBanner: React.FC<StatusNotificationBannerProps> = ({ status }) => {
  if (status === 'SCHEDULED') {
    return (
      <div className="w-full bg-[#FFFBEB] border border-amber-200/80 rounded-2xl p-4 mb-4 relative overflow-hidden shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
            <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider mb-0.5">
              Pickup Scheduled
            </h3>
            <p className="text-xs text-amber-900/90 font-medium leading-relaxed">
              Your pickup is scheduled. We&apos;ll assign an employee before your scheduled time.
            </p>
          </div>
          {/* Decorative Calendar Graphic */}
          <div className="absolute -bottom-2 -right-2 opacity-15 pointer-events-none text-amber-800">
            <CalendarCheck className="w-20 h-20" />
          </div>
        </div>
      </div>
    );
  }

  if (
    status === 'ASSIGNED' ||
    status === 'ON_THE_WAY' ||
    status === 'ARRIVED' ||
    status === 'VERIFIED' ||
    status === 'IN_PROGRESS' ||
    status === 'MEASURED' ||
    status === 'SUMMARY_READY' ||
    status === 'CUSTOMER_CONFIRMED' ||
    status === 'SETTLED' ||
    status === 'COMPLETED'
  ) {
    return (
      <div className="w-full bg-[#ECFDF5] border border-emerald-200/80 rounded-2xl p-4 mb-4 relative overflow-hidden shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
            <UserCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-0.5">
              Employee Assigned
            </h3>
            <p className="text-xs text-emerald-900/90 font-medium leading-relaxed">
              An employee has been assigned. Your pickup executive will contact you before arriving.
            </p>
          </div>
          {/* Decorative Graphic */}
          <div className="absolute -bottom-2 -right-2 opacity-15 pointer-events-none text-emerald-800">
            <ShieldCheck className="w-20 h-20" />
          </div>
        </div>
      </div>
    );
  }

  // Default: Placed State (REQUESTED)
  return (
    <div className="w-full bg-[#ECFDF5] border border-emerald-200/80 rounded-2xl p-4 mb-4 relative overflow-hidden shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
          <Clock className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex-1 pr-6">
          <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-0.5">
            Request Placed
          </h3>
          <p className="text-xs text-emerald-900/90 font-medium leading-relaxed">
            Your request has been placed. We&apos;ll schedule your pickup and assign an employee soon.
          </p>
        </div>
        {/* Decorative Clipboard Check Graphic */}
        <div className="absolute -bottom-2 -right-2 opacity-15 pointer-events-none text-emerald-800">
          <CheckCircle2 className="w-20 h-20" />
        </div>
      </div>
    </div>
  );
};
