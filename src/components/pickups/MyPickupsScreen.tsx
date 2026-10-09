"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PickupCard, PickupItemData } from './PickupCard';
import { EmptyCancelledState } from './EmptyCancelledState';
import { InvoiceModal } from './InvoiceModal';
import { apiClient } from '../../lib/api-client';
import { RefreshCw, Plus, Sparkles } from 'lucide-react';

export type PickupTab = 'scheduled' | 'completed' | 'cancelled';

interface MyPickupsScreenProps {
  onOpenPickupDetails: (pickup: PickupItemData) => void;
  onRequestNewPickup: () => void;
}

// Seed mock pickups matching Image 5
const SEED_SCHEDULED_PICKUPS: PickupItemData[] = [
  {
    id: 'akp-10245',
    pickupCode: 'AKP-10245',
    status: 'ASSIGNED',
    scheduledDate: '2026-10-04',
    timeSlotSnapshot: { displayLabel: '9:00 AM – 11:00 AM' },
    locationLabel: 'Madhura Nagar, Vijayawada',
    assignment: { employeeName: 'Ramesh Kumar', employeeCode: 'AKP-EMP-0247' },
  },
  {
    id: 'akp-10238',
    pickupCode: 'AKP-10238',
    status: 'SCHEDULED',
    scheduledDate: '2026-10-05',
    timeSlotSnapshot: { displayLabel: '10:00 AM – 12:00 PM' },
    locationLabel: 'Madhura Nagar, Vijayawada',
  },
  {
    id: 'akp-10231',
    pickupCode: 'AKP-10231',
    status: 'REQUESTED',
    scheduledDate: '2026-10-06',
    timeSlotSnapshot: { displayLabel: '9:00 AM – 11:00 AM' },
    locationLabel: 'Suryaraopet, Vijayawada',
  },
];

const SEED_COMPLETED_PICKUPS: PickupItemData[] = [
  {
    id: 'akp-10198',
    pickupCode: 'AKP-10198',
    status: 'COMPLETED',
    scheduledDate: '2026-09-28',
    timeSlotSnapshot: { displayLabel: '10:00 AM – 11:30 AM' },
    locationLabel: 'Madhura Nagar, Vijayawada',
  },
  {
    id: 'akp-10175',
    pickupCode: 'AKP-10175',
    status: 'COMPLETED',
    scheduledDate: '2026-09-21',
    timeSlotSnapshot: { displayLabel: '9:00 AM – 11:00 AM' },
    locationLabel: 'Suryaraopet, Vijayawada',
  },
  {
    id: 'akp-10160',
    pickupCode: 'AKP-10160',
    status: 'COMPLETED',
    scheduledDate: '2026-09-12',
    timeSlotSnapshot: { displayLabel: '11:00 AM – 01:00 PM' },
    locationLabel: 'Benz Circle, Vijayawada',
  },
  {
    id: 'akp-10142',
    pickupCode: 'AKP-10142',
    status: 'COMPLETED',
    scheduledDate: '2026-09-05',
    timeSlotSnapshot: { displayLabel: '9:00 AM – 10:30 AM' },
    locationLabel: 'Madhura Nagar, Vijayawada',
  },
  {
    id: 'akp-10110',
    pickupCode: 'AKP-10110',
    status: 'COMPLETED',
    scheduledDate: '2026-08-28',
    timeSlotSnapshot: { displayLabel: '10:00 AM – 12:00 PM' },
    locationLabel: 'Guru Nanak Colony, Vijayawada',
  },
];

const SEED_CANCELLED_PICKUPS: PickupItemData[] = [
  {
    id: 'akp-10168',
    pickupCode: 'AKP-10168',
    status: 'CANCELLED',
    scheduledDate: '2026-09-18',
    timeSlotSnapshot: { displayLabel: '9:00 AM – 11:00 AM' },
    locationLabel: 'Madhura Nagar, Vijayawada',
  },
];

export const MyPickupsScreen: React.FC<MyPickupsScreenProps> = ({
  onOpenPickupDetails,
  onRequestNewPickup,
}) => {
  const [activeTab, setActiveTab] = useState<PickupTab>('scheduled');
  const [livePickups, setLivePickups] = useState<PickupItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInvoicePickup, setSelectedInvoicePickup] = useState<PickupItemData | null>(null);

  // Fetch live pickups from backend API
  const fetchPickups = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<PickupItemData[]>('/customer/pickups');
      if (res.success && Array.isArray(res.data)) {
        setLivePickups(res.data);
      }
    } catch {
      // Keep seed data on network failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups]);

  // Combine live pickups with seed mock pickups
  const scheduledList = useMemo(() => {
    const liveScheduled = livePickups.filter((p) =>
      ['REQUESTED', 'SCHEDULED', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(p.status)
    );
    // Combine live with seed items, ensuring no duplicates by pickupCode
    const codes = new Set(liveScheduled.map((p) => p.pickupCode));
    const merged = [...liveScheduled];
    for (const s of SEED_SCHEDULED_PICKUPS) {
      if (!codes.has(s.pickupCode)) merged.push(s);
    }
    return merged;
  }, [livePickups]);

  const completedList = useMemo(() => {
    const liveCompleted = livePickups.filter((p) =>
      ['COMPLETED', 'SETTLED', 'INVOICED'].includes(p.status)
    );
    const codes = new Set(liveCompleted.map((p) => p.pickupCode));
    const merged = [...liveCompleted];
    for (const s of SEED_COMPLETED_PICKUPS) {
      if (!codes.has(s.pickupCode)) merged.push(s);
    }
    return merged;
  }, [livePickups]);

  const cancelledList = useMemo(() => {
    const liveCancelled = livePickups.filter((p) =>
      ['CANCELLED', 'FAILED'].includes(p.status)
    );
    const codes = new Set(liveCancelled.map((p) => p.pickupCode));
    const merged = [...liveCancelled];
    for (const s of SEED_CANCELLED_PICKUPS) {
      if (!codes.has(s.pickupCode)) merged.push(s);
    }
    return merged;
  }, [livePickups]);

  const currentList =
    activeTab === 'scheduled'
      ? scheduledList
      : activeTab === 'completed'
      ? completedList
      : cancelledList;

  const handleCardClick = (pickup: PickupItemData) => {
    if (activeTab === 'completed' || pickup.status === 'COMPLETED' || pickup.status === 'SETTLED') {
      setSelectedInvoicePickup(pickup);
    } else {
      onOpenPickupDetails(pickup);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4 pb-20 animate-in fade-in">
      {/* 1. Header with Scrap Truck Illustration (Image 5) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs relative overflow-hidden flex items-center justify-between">
        <div className="relative z-10 pr-2 max-w-[240px]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Pickups Hub
            </span>
            <button
              onClick={fetchPickups}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              title="Refresh"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
            My Pickups
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            Track your scheduled and completed scrap pickups.
          </p>
        </div>

        {/* Truck Graphic Illustration matching Image 5 Header */}
        <div className="relative shrink-0 w-28 h-20 flex items-center justify-center">
          {/* Sun */}
          <div className="absolute top-1 right-8 w-6 h-6 rounded-full bg-amber-400/80 shadow-xs" />
          {/* Skyline backdrop silhouette */}
          <div className="absolute bottom-2 right-0 flex items-end gap-1 opacity-20 text-emerald-950 pointer-events-none text-xs">
            🏢 🏬 🌳
          </div>
          {/* Scrap Electric Truck */}
          <div className="relative z-10 transform scale-105">
            <div className="bg-[#0A3D2B] text-white rounded-xl px-2.5 py-1.5 text-center shadow-md border border-emerald-600/40">
              <span className="text-[8px] font-black tracking-widest block text-emerald-300">ASLI</span>
              <span className="text-[9px] font-black tracking-widest block text-white -mt-1">KAATA</span>
            </div>
            {/* Truck Cab & Wheels */}
            <div className="flex items-center justify-between px-1 -mt-1">
              <span className="text-sm">🚛</span>
              <span className="text-[9px] font-bold text-amber-500">⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Segmented Tab Filter Pills (Image 5) */}
      <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
        {/* Tab 1: Scheduled */}
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'scheduled'
              ? 'bg-[#0A3D2B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>Scheduled</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'scheduled'
                ? 'bg-emerald-900/50 text-emerald-200'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {scheduledList.length}
          </span>
        </button>

        {/* Tab 2: Completed */}
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'completed'
              ? 'bg-[#0A3D2B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>Completed</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'completed'
                ? 'bg-emerald-900/50 text-emerald-200'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {completedList.length}
          </span>
        </button>

        {/* Tab 3: Cancelled (Vibrant Red when active matching Image 5 Screen 3) */}
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'cancelled'
              ? 'bg-[#DC2626] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>Cancelled</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'cancelled'
                ? 'bg-rose-950/40 text-rose-200'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {cancelledList.length}
          </span>
        </button>
      </div>

      {/* 3. Pickups List Area */}
      <div className="space-y-3">
        {currentList.map((pickup) => (
          <PickupCard
            key={pickup.id || pickup._id || pickup.pickupCode}
            pickup={pickup}
            onClick={() => handleCardClick(pickup)}
          />
        ))}

        {/* If Cancelled Tab: Display Empty Cancelled State below list matching Image 5 Screen 3 */}
        {activeTab === 'cancelled' && (
          <EmptyCancelledState />
        )}

        {/* Empty state for Scheduled tab if 0 */}
        {activeTab === 'scheduled' && scheduledList.length === 0 && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0A3D2B] flex items-center justify-center mx-auto text-xl">
              📦
            </div>
            <h3 className="text-sm font-black text-slate-900">No Scheduled Pickups</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You don&apos;t have any active scrap pickups scheduled right now.
            </p>
            <button
              onClick={onRequestNewPickup}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A3D2B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#06291C]"
            >
              <Plus className="w-3.5 h-3.5" />
              Book a Pickup
            </button>
          </div>
        )}
      </div>

      {/* Digital Invoice Modal */}
      {selectedInvoicePickup && (
        <InvoiceModal
          isOpen={true}
          pickupId={selectedInvoicePickup._id || selectedInvoicePickup.id || ''}
          pickupCode={selectedInvoicePickup.pickupCode}
          onClose={() => setSelectedInvoicePickup(null)}
        />
      )}
    </div>
  );
};
