"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api-client';

export interface PickupOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  address: string;
  city: string;
  category: string;
  estimatedWeightKg: number;
  slot: string;
  status: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  vehicleNumber?: string;
  createdAt: string;
}

interface AdminDispatchQueueTabProps {
  onUnassignedCountChange?: (count: number) => void;
}

export const AdminDispatchQueueTab: React.FC<AdminDispatchQueueTabProps> = ({
  onUnassignedCountChange,
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string; phone: string }>>([]);
  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string; capacityKg: number }>>([]);
  
  // Modal states
  const [assignModalPickup, setAssignModalPickup] = useState<PickupOrder | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [assigning, setAssigning] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch real pickups from backend
  const fetchLivePickups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.listAdminPickups(filter !== 'ALL' ? filter : undefined);
      if (res.success && Array.isArray(res.data)) {
        const mapped: PickupOrder[] = res.data.map((item: any) => {
          const id = item._id || item.id || '';
          return {
            id,
            orderNumber: item.orderNumber || `AK-${id.slice(-6).toUpperCase()}`,
            customerName: item.customerProfileId?.name || item.customerName || 'Direct Customer',
            customerMobile: item.customerProfileId?.mobile || item.customerMobile || '+91 Mobile',
            address: typeof item.address === 'string' ? item.address : item.address?.streetAddress || 'Address on record',
            city: item.address?.city || 'Vijayawada',
            category: Array.isArray(item.categories) ? item.categories.join(', ') : item.category || 'Scrap Material',
            estimatedWeightKg: item.estimatedWeightKg || (item.totals?.netWeightGrams ? item.totals.netWeightGrams / 1000 : 25),
            slot: item.scheduledSlot?.date ? `${item.scheduledSlot.date} (${item.scheduledSlot.window || 'General'})` : 'Today',
            status: item.status || 'REQUESTED',
            assignedDriverId: item.assignment?.employeeProfileId,
            assignedDriverName: item.assignedEmployeeProfileId?.fullName || item.assignedEmployeeName || (item.assignment?.employeeProfileId ? 'Assigned Field Officer' : undefined),
            vehicleNumber: item.assignment?.vehicleId || item.vehicleId,
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
          };
        });
        setPickups(mapped);

        // Update unassigned count
        const unassigned = mapped.filter((p) => p.status === 'REQUESTED' || p.status === 'SCHEDULED').length;
        onUnassignedCountChange?.(unassigned);
      } else {
        setPickups([]);
        onUnassignedCountChange?.(0);
      }
    } catch {
      setPickups([]);
    } finally {
      setLoading(false);
    }
  }, [filter, onUnassignedCountChange]);

  // Fetch real drivers and vehicles for assignment dropdowns
  const fetchDriversAndVehicles = useCallback(async () => {
    try {
      const [empRes, vehRes] = await Promise.all([
        apiClient.listEmployees(),
        apiClient.listVehicles(),
      ]);

      if (empRes.success && Array.isArray(empRes.data)) {
        const mappedDrivers = empRes.data.map((e: any) => ({
          id: e._id || e.id,
          name: e.fullName || e.name || 'Field Driver',
          phone: e.userId?.mobile || e.phone || '',
        }));
        setDrivers(mappedDrivers);
        if (mappedDrivers.length > 0 && !selectedDriver) {
          setSelectedDriver(mappedDrivers[0].id);
        }
      }

      if (vehRes.success && Array.isArray(vehRes.data)) {
        const mappedVehicles = vehRes.data.map((v: any) => ({
          id: v._id || v.id,
          name: `${v.name || 'Truck'} (${v.registrationNumber || 'AP Reg'})`,
          capacityKg: v.capacityKg || 1000,
        }));
        setVehicles(mappedVehicles);
        if (mappedVehicles.length > 0 && !selectedVehicle) {
          setSelectedVehicle(mappedVehicles[0].id);
        }
      }
    } catch {}
  }, [selectedDriver, selectedVehicle]);

  useEffect(() => {
    fetchLivePickups();
    fetchDriversAndVehicles();
  }, [fetchLivePickups, fetchDriversAndVehicles]);

  const handleOpenAssignModal = (pickup: PickupOrder) => {
    setAssignModalPickup(pickup);
  };

  const handleConfirmAssign = async () => {
    if (!assignModalPickup) return;
    if (!selectedDriver) {
      setStatusBanner({ message: 'Please select a driver from the list.', type: 'error' });
      return;
    }

    setAssigning(true);
    try {
      const res = await apiClient.assignPickup(assignModalPickup.id, selectedDriver, selectedVehicle || undefined);
      if (res.success) {
        setStatusBanner({
          message: `Pickup ${assignModalPickup.orderNumber} successfully assigned to driver!`,
          type: 'success',
        });
        setAssignModalPickup(null);
        await fetchLivePickups();
      } else {
        setStatusBanner({ message: res.error || 'Failed to assign pickup.', type: 'error' });
      }
    } catch (err: any) {
      setStatusBanner({ message: err.message || 'Error communicating with dispatch server.', type: 'error' });
    } finally {
      setAssigning(false);
      setTimeout(() => setStatusBanner(null), 5000);
    }
  };

  const handleCancelPickup = async (pickupId: string) => {
    const reason = prompt('Please enter cancellation reason:', 'Customer rescheduled or unavailable');
    if (!reason) return;

    try {
      const res = await apiClient.cancelPickup(pickupId, reason);
      if (res.success) {
        setStatusBanner({ message: 'Pickup has been cancelled in system.', type: 'success' });
        await fetchLivePickups();
      } else {
        setStatusBanner({ message: res.error || 'Could not cancel pickup.', type: 'error' });
      }
    } catch (err: any) {
      setStatusBanner({ message: err.message || 'Cancellation request failed.', type: 'error' });
    }
  };

  const filteredPickups = pickups.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.orderNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerMobile.includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
      case 'SCHEDULED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
            ● UNASSIGNED
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/40">
            ✓ ASSIGNED
          </span>
        );
      case 'ON_THE_WAY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            🚚 EN ROUTE
          </span>
        );
      case 'ARRIVED':
      case 'VERIFIED':
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/40">
            ⚖️ WEIGHING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            ✓ COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40">
            ✕ CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Alert Banner */}
      {statusBanner && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            statusBanner.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          <span>{statusBanner.message}</span>
          <button onClick={() => setStatusBanner(null)} className="cursor-pointer font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Live Operations Dispatch Queue</h2>
          <p className="text-xs text-slate-400">
            Real-time customer bookings from mobile app awaiting vehicle dispatch & driver assignment
          </p>
        </div>

        <button
          onClick={fetchLivePickups}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Live Queue</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 bg-[#1E293B] rounded-2xl border border-slate-800">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'REQUESTED', label: 'Unassigned' },
            { id: 'ASSIGNED', label: 'Assigned' },
            { id: 'ON_THE_WAY', label: 'En Route' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="w-full bg-[#0F172A] border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Pickups Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Order ID & Slot</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Est. Scrap</th>
                <th className="py-3.5 px-4">Live Status</th>
                <th className="py-3.5 px-4">Assigned Personnel</th>
                <th className="py-3.5 px-4 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading real-time pickups from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPickups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="text-3xl">📦</div>
                      <div className="font-bold text-white">No Pickups Found in Queue</div>
                      <p className="text-[11px] text-slate-500">
                        When customers submit scrap pickup bookings via the Customer App, they will appear here dynamically in real-time.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPickups.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Order ID & Slot */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-emerald-400">{p.orderNumber}</div>
                      <div className="text-[11px] text-slate-400">{p.createdAt}</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">{p.slot}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{p.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.customerMobile}</div>
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-200 line-clamp-1">{p.address}</div>
                      <div className="text-[11px] text-slate-400">{p.city}</div>
                    </td>

                    {/* Est. Scrap */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{p.category}</div>
                      <div className="text-[11px] font-mono text-emerald-400 font-bold">
                        ~{p.estimatedWeightKg} kg
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>

                    {/* Assigned Personnel */}
                    <td className="py-3.5 px-4">
                      {p.assignedDriverName ? (
                        <div>
                          <div className="font-semibold text-slate-200">{p.assignedDriverName}</div>
                          {p.vehicleNumber && <div className="text-[11px] text-slate-400">{p.vehicleNumber}</div>}
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-400 font-medium italic">
                          Awaiting Assignment
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'REQUESTED' || p.status === 'SCHEDULED' ? (
                        <button
                          onClick={() => handleOpenAssignModal(p)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
                        >
                          <span>Assign Driver</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : p.status === 'ASSIGNED' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenAssignModal(p)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
                          >
                            Reassign
                          </button>
                          <button
                            onClick={() => handleCancelPickup(p.id)}
                            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Lifecycle Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Assignment Modal */}
      {assignModalPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Manual Driver Assignment</h3>
                <p className="text-xs text-slate-400">Order: {assignModalPickup.orderNumber}</p>
              </div>
              <button
                onClick={() => setAssignModalPickup(null)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Order Brief */}
            <div className="my-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{assignModalPickup.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Address:</span>
                <span className="text-slate-200 text-right">{assignModalPickup.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Est. Scrap:</span>
                <span className="font-bold text-emerald-400">
                  {assignModalPickup.category} (~{assignModalPickup.estimatedWeightKg} kg)
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Select Registered Driver
                </label>
                {drivers.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                    No approved employees found in database. Once an employee registers via Employee App, they will appear here.
                  </div>
                ) : (
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.phone ? `(${d.phone})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Deploy Vehicle (Optional)
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                >
                  <option value="">No Vehicle Bound (Handcart / Foot)</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} • Max {v.capacityKg} kg
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAssignModalPickup(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                disabled={assigning || !selectedDriver}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                {assigning ? 'Dispatching...' : 'Confirm Dispatch & Push to Employee App'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
