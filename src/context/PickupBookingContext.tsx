"use client";

import React, { createContext, useContext, useState } from 'react';

export interface ScrapCategoryItem {
  id: string;
  name: string;
  code: string;
  emoji: string;
  description: string;
}

export interface WeightRangeItem {
  id: string;
  label: string;
  description: string;
  bags: string;
}

export interface TimeSlotItem {
  id: string;
  period: 'morning' | 'afternoon' | 'evening';
  displayLabel: string;
  startTime: string;
  endTime: string;
}

export interface BookingState {
  step: 1 | 2 | 3 | 4 | 5;
  selectedCategoryIds: string[];
  selectedWeightRangeId: string;
  selectedDate: string; // YYYY-MM-DD
  selectedSlotId: string;
  paymentPreference: 'CASH' | 'UPI' | 'DONATE';
  addressId?: string;
  remarks?: string;
  confirmedPickup?: any;
}

interface PickupBookingContextType {
  state: BookingState;
  setStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  toggleCategory: (categoryId: string) => void;
  setWeightRange: (rangeId: string) => void;
  setDate: (date: string) => void;
  setSlot: (slotId: string) => void;
  setPaymentPreference: (pref: 'CASH' | 'UPI' | 'DONATE') => void;
  setRemarks: (remarks: string) => void;
  setConfirmedPickup: (pickup: any) => void;
  resetBooking: () => void;
}

// Default Seed Categories matching Image 3 Screen 1
export const AVAILABLE_CATEGORIES: ScrapCategoryItem[] = [
  { id: 'cat_paper', name: 'Paper', code: 'PAPER', emoji: '📄', description: 'Newspapers, cartons, books' },
  { id: 'cat_plastic', name: 'Plastic', code: 'PLASTIC', emoji: '🍾', description: 'Bottles, containers, cans' },
  { id: 'cat_metal', name: 'Metal', code: 'METAL', emoji: '⚙️', description: 'Iron, aluminium, copper' },
  { id: 'cat_ewaste', name: 'E-Waste', code: 'EWASTE', emoji: '💻', description: 'Appliances, wires, PCs' },
  { id: 'cat_rubber', name: 'Rubber / Tyres', code: 'RUBBER', emoji: '🛞', description: 'Tyres, tubes, mats' },
  { id: 'cat_others', name: 'Others', code: 'OTHERS', emoji: '📦', description: 'Glass, batteries, mixed' },
];

// Default Weight Ranges matching Image 3 Screen 2
export const AVAILABLE_WEIGHT_RANGES: WeightRangeItem[] = [
  { id: 'wr_0_10', label: '0 – 10 kg', description: 'Small amount', bags: '1–2 bags' },
  { id: 'wr_10_20', label: '10 – 20 kg', description: 'A few bags', bags: '2–3 bags' },
  { id: 'wr_20_30', label: '20 – 30 kg', description: 'Medium amount', bags: '4–5 bags' },
  { id: 'wr_30_50', label: '30 – 50 kg', description: 'Large amount', bags: 'Multiple boxes' },
  { id: 'wr_50_plus', label: '50+ kg', description: 'Bulk amount', bags: 'Truck load' },
];

// Default Time Slots matching Image 3 Screen 3
export const AVAILABLE_TIME_SLOTS: TimeSlotItem[] = [
  { id: 'slot_m1', period: 'morning', displayLabel: '9:00 AM – 11:00 AM', startTime: '09:00', endTime: '11:00' },
  { id: 'slot_m2', period: 'morning', displayLabel: '11:00 AM – 1:00 PM', startTime: '11:00', endTime: '13:00' },
  { id: 'slot_a1', period: 'afternoon', displayLabel: '1:00 PM – 3:00 PM', startTime: '13:00', endTime: '15:00' },
  { id: 'slot_a2', period: 'afternoon', displayLabel: '3:00 PM – 5:00 PM', startTime: '15:00', endTime: '17:00' },
  { id: 'slot_e1', period: 'evening', displayLabel: '5:00 PM – 7:00 PM', startTime: '17:00', endTime: '19:00' },
  { id: 'slot_e2', period: 'evening', displayLabel: '7:00 PM – 8:00 PM', startTime: '19:00', endTime: '20:00' },
];

const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const initialState: BookingState = {
  step: 1,
  selectedCategoryIds: ['cat_paper', 'cat_metal'],
  selectedWeightRangeId: 'wr_10_20',
  selectedDate: getTomorrowDate(),
  selectedSlotId: 'slot_m2',
  paymentPreference: 'CASH',
  remarks: '',
  confirmedPickup: null,
};

const PickupBookingContext = createContext<PickupBookingContextType | undefined>(undefined);

export function PickupBookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(initialState);

  const setStep = (step: 1 | 2 | 3 | 4 | 5) => {
    setState((prev) => ({ ...prev, step }));
  };

  const toggleCategory = (categoryId: string) => {
    setState((prev) => {
      const exists = prev.selectedCategoryIds.includes(categoryId);
      const updated = exists
        ? prev.selectedCategoryIds.filter((id) => id !== categoryId)
        : [...prev.selectedCategoryIds, categoryId];
      return { ...prev, selectedCategoryIds: updated };
    });
  };

  const setWeightRange = (rangeId: string) => {
    setState((prev) => ({ ...prev, selectedWeightRangeId: rangeId }));
  };

  const setDate = (date: string) => {
    setState((prev) => ({ ...prev, selectedDate: date }));
  };

  const setSlot = (slotId: string) => {
    setState((prev) => ({ ...prev, selectedSlotId: slotId }));
  };

  const setPaymentPreference = (pref: 'CASH' | 'UPI' | 'DONATE') => {
    setState((prev) => ({ ...prev, paymentPreference: pref }));
  };

  const setRemarks = (remarks: string) => {
    setState((prev) => ({ ...prev, remarks }));
  };

  const setConfirmedPickup = (pickup: any) => {
    setState((prev) => ({ ...prev, confirmedPickup: pickup }));
  };

  const resetBooking = () => {
    setState({ ...initialState, selectedDate: getTomorrowDate() });
  };

  return (
    <PickupBookingContext.Provider
      value={{
        state,
        setStep,
        toggleCategory,
        setWeightRange,
        setDate,
        setSlot,
        setPaymentPreference,
        setRemarks,
        setConfirmedPickup,
        resetBooking,
      }}
    >
      {children}
    </PickupBookingContext.Provider>
  );
}

export function usePickupBooking() {
  const context = useContext(PickupBookingContext);
  if (!context) {
    throw new Error('usePickupBooking must be used within a PickupBookingProvider');
  }
  return context;
}
