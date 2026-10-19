"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api-client';

interface VehicleRecord {
  id: string;
  registrationNumber: string;
  name: string;
  vehicleType: string;
  capacityKg: number;
  maxStops: number;
  defaultEmployeeId?: string;
  defaultEmployeeName?: string;
}

export const AdminFleetTab: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [regNumber, setRegNumber] = useState('');
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState('Tata Ace Gold (Diesel)');
  const [capacityKg, setCapacityKg] = useState('1000');
  const [maxStops, setMaxStops] = useState('15');
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const fetchFleet = useCallback(async () => {
    setLoading(true);
    try {
      const [vehRes, empRes] = await Promise.all([
        apiClient.listVehicles(),
        apiClient.listEmployees(),
      ]);

      let driverMap: Record<string, string> = {};
      if (empRes.success && Array.isArray(empRes.data)) {
        const dList = empRes.data.map((e: any) => ({
          id: e._id || e.id,
          name: e.fullName || e.name || 'Driver',
        }));
        setDrivers(dList);
        dList.forEach((d: any) => {
          driverMap[d.id] = d.name;
        });
      }

      if (vehRes.success && Array.isArray(vehRes.data)) {
        const mapped: VehicleRecord[] = vehRes.data.map((v: any) => ({
          id: v._id || v.id,
          registrationNumber: v.registrationNumber,
          name: v.name || 'Collection Truck',
          vehicleType: v.vehicleType || 'Truck',
          capacityKg: v.capacityKg || 1000,
          maxStops: v.maxStops || 15,
          defaultEmployeeId: v.defaultEmployeeId,
          defaultEmployeeName: v.defaultEmployeeId ? driverMap[v.defaultEmployeeId] || 'Assigned Officer' : undefined,
        }));
        setVehicles(mapped);
      } else {
        setVehicles([]);
      }
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFleet();
  }, [fetchFleet]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim() || !name.trim()) return;

    setSaving(true);
    try {
      const res = await apiClient.createVehicle({
        registrationNumber: regNumber.trim().toUpperCase(),
        name: name.trim(),
        vehicleType,
        capacityKg: parseInt(capacityKg) || 1000,
        maxStops: parseInt(maxStops) || 15,
        defaultEmployeeId: selectedDriverId || undefined,
      });

      if (res.success) {
        setStatusBanner({ message: `Vehicle ${regNumber.toUpperCase()} successfully registered in fleet!`, type: 'success' });
        setShowAddModal(false);
        setRegNumber('');
        setName('');
        await fetchFleet();
      } else {
        setStatusBanner({ message: res.error || 'Failed to register vehicle.', type: 'error' });
      }
    } catch (err: any) {
      setStatusBanner({ message: err.message || 'Error communicating with vehicle registry.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusBanner(null), 5000);
    }
  };

  const handleDeleteVehicle = async (id: string, plate: string) => {
    if (!confirm(`Are you sure you want to remove vehicle ${plate} from the fleet ledger?`)) return;

    try {
      const res = await apiClient.deleteVehicle(id);
      if (res.success) {
        setStatusBanner({ message: `Vehicle ${plate} removed from registry.`, type: 'success' });
        await fetchFleet();
      } else {
        setStatusBanner({ message: res.error || 'Failed to remove vehicle.', type: 'error' });
      }
    } catch (err: any) {
      setStatusBanner({ message: err.message || 'Error deleting vehicle.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      {statusBanner && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
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
          <h2 className="text-lg font-black text-white">Fleet & Logistics Vehicle Ledger</h2>
          <p className="text-xs text-slate-400">
            Registered collection vehicles, payload capacities, and default driver bindings
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Register New Vehicle</span>
        </button>
      </div>

      {/* Vehicles Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Registration Plate</th>
                <th className="py-3.5 px-4">Vehicle Identifier</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Payload Capacity</th>
                <th className="py-3.5 px-4">Max Stops / Day</th>
                <th className="py-3.5 px-4">Bound Driver</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading fleet vehicles from database...</span>
                    </div>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="text-3xl">🚚</div>
                      <div className="font-bold text-white">No Vehicles Registered in Fleet</div>
                      <p className="text-[11px] text-slate-500">
                        Add your first collection vehicle (e.g. Tata Ace, Electric 3-Wheeler) to enable automated route dispatching.
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                      >
                        <span>Register Fleet Vehicle</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{v.registrationNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{v.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{v.vehicleType}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{v.capacityKg} kg</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{v.maxStops} stops</td>
                    <td className="py-3.5 px-4">
                      {v.defaultEmployeeName ? (
                        <span className="font-medium text-slate-200">{v.defaultEmployeeName}</span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteVehicle(v.id, v.registrationNumber)}
                        className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-medium text-[11px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Register Collection Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Registration Plate (RTO Number)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AP 16 TX 4920"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Vehicle Name / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Ace Gold #1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Tata Ace Gold (Diesel)">Tata Ace Gold (Diesel)</option>
                    <option value="Electric 3-Wheeler Cargo">Electric 3-Wheeler Cargo</option>
                    <option value="Piaggio Ape Extra">Piaggio Ape Extra</option>
                    <option value="Mahindra Bolero Maxi">Mahindra Bolero Maxi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Payload (kg)</label>
                  <input
                    type="number"
                    required
                    value={capacityKg}
                    onChange={(e) => setCapacityKg(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Bound Driver (Optional)</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">None (Pool Vehicle)</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
