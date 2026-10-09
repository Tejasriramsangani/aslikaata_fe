"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Trash2,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { LifecycleStepper, PickupLifecycleStatus } from './LifecycleStepper';
import { StatusNotificationBanner } from './StatusNotificationBanner';
import { EmployeeContactCard, EmployeeInfo } from './EmployeeContactCard';
import { SelectedCategoriesEditor } from './SelectedCategoriesEditor';
import { RescheduleModal } from './RescheduleModal';
import { AdditionalInfoSection } from './AdditionalInfoSection';
import { CancelPickupModal } from './CancelPickupModal';
import { apiClient } from '../../lib/api-client';

export interface PickupDetailData {
  _id?: string;
  id?: string;
  pickupCode: string;
  status: PickupLifecycleStatus | string;
  scheduledDate: string; // YYYY-MM-DD
  timeSlotSnapshot?: {
    startTime: string;
    endTime: string;
    displayLabel: string;
  };
  timeSlotId?: string;
  categories: string[] | any[];
  estimatedWeightSnapshot?: {
    name: string;
    displayLabel: string;
  };
  settlementPreference?: string;
  assignment?: EmployeeInfo | null;
  preparation?: {
    tools?: string[];
    remarks?: string;
  };
  photos?: Array<{ fileUrl: string }> | string[];
}

interface PickupDetailsScreenProps {
  pickupId?: string;
  initialPickup?: PickupDetailData | null;
  onBack: () => void;
  onPickupCancelled?: () => void;
}

const normalizeCategories = (raw: any): any[] => {
  if (!raw) return ['cat_paper', 'cat_metal'];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    return raw.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
  }
  return ['cat_paper', 'cat_metal'];
};

export const PickupDetailsScreen: React.FC<PickupDetailsScreenProps> = ({
  pickupId,
  initialPickup,
  onBack,
  onPickupCancelled,
}) => {
  // Default mock pickup data matching Image 4
  const [pickup, setPickup] = useState<PickupDetailData>(() => {
    if (initialPickup) {
      return {
        ...initialPickup,
        categories: normalizeCategories(initialPickup.categories),
      };
    }
    return {
      id: pickupId || 'demo_pickup_1001',
      pickupCode: 'AKP-84920',
      status: 'REQUESTED', // Screen 1: REQUESTED, Screen 2: SCHEDULED, Screen 3: ASSIGNED
      scheduledDate: '2026-10-04',
      timeSlotSnapshot: {
        startTime: '09:00',
        endTime: '11:00',
        displayLabel: '9:00 AM – 11:00 AM',
      },
      timeSlotId: 'slot_m1',
      categories: ['cat_paper', 'cat_plastic', 'cat_metal'],
      estimatedWeightSnapshot: {
        name: 'Medium',
        displayLabel: '20 – 30 kg',
      },
      settlementPreference: 'CASH',
      assignment: {
        employeeName: 'Ramesh Kumar',
        employeeCode: 'AKP-EMP-0247',
        employeePhone: '9876543210',
        vehicleType: 'Ape Auto',
        vehicleNumber: 'AP 16 TX 4021',
      },
      preparation: {
        tools: ['Ladder'],
        remarks: 'Scrap kept near main gate. Please call 10 mins before arrival.',
      },
      photos: [
        { fileUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=150&auto=format&fit=crop&q=80' },
        { fileUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=150&auto=format&fit=crop&q=80' },
      ],
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentPickupId = pickup._id || pickup.id || pickupId || '';

  // Fetch fresh pickup details from backend API
  const fetchPickupDetails = useCallback(async () => {
    if (!currentPickupId || currentPickupId.startsWith('demo_')) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get<PickupDetailData>(`/pickups/${currentPickupId}`);
      if (res.success && res.data) {
        setPickup({
          ...res.data,
          categories: normalizeCategories(res.data.categories),
        });
      }
    } catch {
      // Keep existing state
    } finally {
      setIsLoading(false);
    }
  }, [currentPickupId]);

  useEffect(() => {
    fetchPickupDetails();
  }, [fetchPickupDetails]);

  // Connect to Real-time WebSockets via Socket.IO (Phase 6.4)
  useEffect(() => {
    if (!currentPickupId) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('aslikaata_customer_access_token') : null;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

    const socket: Socket = io(socketUrl, {
      auth: { token: token ? `Bearer ${token}` : '' },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      // Join pickup room for live push events
      socket.emit('join_pickup', { pickupId: currentPickupId });
    });

    // Listen for live status transitions
    socket.on('pickup.status_changed', (payload: any) => {
      if (payload?.status) {
        setPickup((prev) => ({
          ...prev,
          status: payload.status,
          scheduledDate: payload.scheduledDate || prev.scheduledDate,
        }));
        showToast(`Pickup status updated: ${payload.status}`);
      }
    });

    // Listen for live employee assignment
    socket.on('pickup.assigned', (payload: any) => {
      setPickup((prev) => ({
        ...prev,
        status: 'ASSIGNED',
        assignment: {
          employeeName: payload?.employeeName || 'Ramesh Kumar',
          employeeCode: payload?.employeeCode || 'AKP-EMP-0247',
          employeePhone: payload?.employeePhone || '9876543210',
          vehicleType: payload?.vehicleType || 'Ape Auto',
          vehicleNumber: payload?.vehicleNumber || 'AP 16 TX 4021',
        },
      }));
      showToast('An employee has been assigned to your pickup!');
    });

    return () => {
      socket.disconnect();
    };
  }, [currentPickupId]);

  // Sync initialPickup if it updates
  useEffect(() => {
    if (initialPickup) {
      setPickup((prev) => ({
        ...prev,
        ...initialPickup,
        categories: normalizeCategories(initialPickup.categories),
      }));
    }
  }, [initialPickup]);

  // Normalize category IDs list safely
  const categoryIds = React.useMemo(() => {
    const cats = normalizeCategories(pickup?.categories);
    return cats
      .map((c: any) => (typeof c === 'string' ? c : c?._id || c?.code || c?.name || ''))
      .filter(Boolean);
  }, [pickup?.categories]);

  // Handle category update
  const handleUpdateCategories = async (newCategoryIds: string[]) => {
    setPickup((prev) => ({ ...prev, categories: newCategoryIds }));
    if (!currentPickupId.startsWith('demo_')) {
      try {
        const res = await apiClient.patch(`/customer/pickups/${currentPickupId}/categories`, {
          categoryIds: newCategoryIds,
        });
        if (res.success) {
          showToast('Categories updated successfully');
        }
      } catch {
        showToast('Updated locally');
      }
    } else {
      showToast('Categories updated');
    }
  };

  // Handle rescheduling
  const handleReschedule = async (newDate: string, newSlotId?: string, reason?: string) => {
    const slotObj = newSlotId ? { startTime: '09:00', endTime: '11:00', displayLabel: '9:00 AM – 11:00 AM' } : undefined;
    setPickup((prev) => ({
      ...prev,
      scheduledDate: newDate,
      timeSlotId: newSlotId || prev.timeSlotId,
      timeSlotSnapshot: slotObj || prev.timeSlotSnapshot,
      status: prev.status === 'REQUESTED' ? 'SCHEDULED' : prev.status,
    }));

    if (!currentPickupId.startsWith('demo_')) {
      try {
        const res = await apiClient.patch(`/customer/pickups/${currentPickupId}/reschedule`, {
          scheduledDate: newDate,
          timeSlotId: newSlotId,
          reason,
        });
        if (res.success) {
          showToast('Pickup rescheduled successfully');
          fetchPickupDetails();
        }
      } catch {
        showToast('Rescheduled locally');
      }
    } else {
      showToast('Pickup rescheduled to ' + newDate);
    }
  };

  // Handle preparation updates (tools, remarks, photos)
  const handleSavePreparation = async (payload: {
    tools?: string[];
    remarks?: string;
    photoUrls?: string[];
  }) => {
    setPickup((prev) => ({
      ...prev,
      preparation: {
        tools: payload.tools ?? prev.preparation?.tools ?? [],
        remarks: payload.remarks ?? prev.preparation?.remarks ?? '',
      },
    }));

    if (!currentPickupId.startsWith('demo_')) {
      try {
        await apiClient.patch(`/customer/pickups/${currentPickupId}/preparation`, payload);
        showToast('Information saved');
      } catch {
        showToast('Saved locally');
      }
    } else {
      showToast('Information saved');
    }
  };

  // Handle cancellation
  const handleCancelPickup = async (reason: string) => {
    setPickup((prev) => ({ ...prev, status: 'CANCELLED' }));
    if (!currentPickupId.startsWith('demo_')) {
      try {
        await apiClient.post(`/customer/pickups/${currentPickupId}/cancel`, { reason });
      } catch {}
    }
    showToast('Pickup request cancelled');
    setTimeout(() => {
      if (onPickupCancelled) onPickupCancelled();
      else onBack();
    }, 1500);
  };

  // Format date helper
  const formattedDate = React.useMemo(() => {
    if (!pickup.scheduledDate) return 'Sat, 04 Oct 2026';
    try {
      const d = new Date(pickup.scheduledDate);
      if (isNaN(d.getTime())) return pickup.scheduledDate;
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return pickup.scheduledDate;
    }
  }, [pickup.scheduledDate]);

  const isAssigned =
    pickup.status === 'ASSIGNED' ||
    pickup.status === 'ON_THE_WAY' ||
    pickup.status === 'ARRIVED' ||
    pickup.status === 'VERIFIED' ||
    pickup.status === 'IN_PROGRESS' ||
    pickup.status === 'COMPLETED';

  const isLocked = pickup.status === 'COMPLETED' || pickup.status === 'CANCELLED';

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-10 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-4">
          <div className="bg-slate-900/90 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Header matching Image 4 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="text-center">
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            Pickup Details
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            ID: {pickup.pickupCode}
          </p>
        </div>

        <button
          onClick={fetchPickupDetails}
          disabled={isLoading}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 py-3 max-w-md mx-auto w-full">
        {/* Quick Testing Bar for Image 4 States */}
        <div className="mb-3 px-2 py-1.5 bg-slate-100 rounded-xl flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>Image 4 Preview State:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPickup((p) => ({ ...p, status: 'REQUESTED' }))}
              className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                pickup.status === 'REQUESTED'
                  ? 'bg-[#0A3D2B] text-white'
                  : 'bg-white hover:bg-slate-200 text-slate-700'
              }`}
            >
              1. Placed
            </button>
            <button
              onClick={() => setPickup((p) => ({ ...p, status: 'SCHEDULED' }))}
              className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                pickup.status === 'SCHEDULED'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white hover:bg-slate-200 text-slate-700'
              }`}
            >
              2. Scheduled
            </button>
            <button
              onClick={() => setPickup((p) => ({ ...p, status: 'ASSIGNED' }))}
              className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                isAssigned
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white hover:bg-slate-200 text-slate-700'
              }`}
            >
              3. Assigned
            </button>
          </div>
        </div>

        {/* 1. Lifecycle 3-Step Stepper (Image 4) */}
        <LifecycleStepper status={pickup.status} />

        {/* 2. Status Notification Banner (Image 4) */}
        <StatusNotificationBanner status={pickup.status} />

        {/* 3. Assigned Employee Contact Card (Only in Screen 3 Assigned State) */}
        {isAssigned && (
          <EmployeeContactCard employee={pickup.assignment} />
        )}

        {/* 4. Selected Categories Editor (Image 4) */}
        <SelectedCategoriesEditor
          categoryIds={categoryIds}
          isLocked={isLocked}
          onUpdateCategories={handleUpdateCategories}
        />

        {/* 5. Scheduled Date & Time Card (Image 4) */}
        <div className="w-full bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Scheduled Slot
              </p>
              <h4 className="text-xs font-black text-slate-900 mt-0.5">
                {formattedDate}
              </h4>
              <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                {pickup.timeSlotSnapshot?.displayLabel || '9:00 AM – 11:00 AM'}
              </p>
            </div>
          </div>

          {!isLocked && (
            <button
              onClick={() => setIsRescheduleOpen(true)}
              className="text-xs font-bold text-[#0A3D2B] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Reschedule
            </button>
          )}
        </div>

        {/* 6. Payment Method Card (Image 4) */}
        <div className="w-full bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Payment Method
              </p>
              <h4 className="text-xs font-black text-slate-900 mt-0.5">
                {pickup.settlementPreference === 'UPI'
                  ? 'Instant UPI'
                  : pickup.settlementPreference === 'DONATE'
                  ? 'Donate to NGO'
                  : 'Cash (Pay on pickup)'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Amount weighed on digital scale
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-200">
            Guaranteed
          </span>
        </div>

        {/* 7. Additional Information Card (Tools, Photos, Notes) */}
        <AdditionalInfoSection
          initialTools={pickup.preparation?.tools || ['Ladder']}
          initialPhotos={
            pickup.photos
              ? pickup.photos.map((p) => (typeof p === 'string' ? p : p.fileUrl))
              : undefined
          }
          initialRemarks={pickup.preparation?.remarks}
          isLocked={isLocked}
          onSavePreparation={handleSavePreparation}
        />

        {/* 8. Cancel Pickup Request Action (Image 4) */}
        {!isLocked && (
          <div className="pt-2">
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-50/60 active:scale-[0.99] text-rose-600 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group"
            >
              <Trash2 className="w-4 h-4 stroke-[2.2] group-hover:rotate-6 transition-transform" />
              <span>Cancel Pickup Request</span>
            </button>
          </div>
        )}
      </main>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleOpen}
        currentDate={pickup.scheduledDate}
        currentSlotId={pickup.timeSlotId}
        onClose={() => setIsRescheduleOpen(false)}
        onConfirmReschedule={handleReschedule}
      />

      {/* Cancel Confirmation Modal */}
      <CancelPickupModal
        isOpen={isCancelModalOpen}
        pickupCode={pickup.pickupCode}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleCancelPickup}
      />
    </div>
  );
};
