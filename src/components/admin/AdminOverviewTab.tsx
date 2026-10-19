"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client';

interface AdminOverviewTabProps {
  onNavigateTab: (tab: any) => void;
  unassignedCount: number;
}

interface TodayAnalyticsData {
  date: string;
  statusDistribution: Record<string, number>;
  unassignedRequests: number;
  activeEmployeesCount: number;
  weightCollected: {
    grossWeightGrams: number;
    wastageGrams: number;
    netWeightGrams: number;
    wastagePercentage: number;
  };
  financials?: {
    totalAmountPaid?: number;
    cashAmount?: number;
    upiAmount?: number;
  };
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  onNavigateTab,
  unassignedCount,
}) => {
  const [data, setData] = useState<TodayAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getTodayAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        // Fallback default structure
        setData({
          date: new Date().toISOString().split('T')[0],
          statusDistribution: {},
          unassignedRequests: unassignedCount,
          activeEmployeesCount: 0,
          weightCollected: {
            grossWeightGrams: 0,
            wastageGrams: 0,
            netWeightGrams: 0,
            wastagePercentage: 0,
          },
          financials: {
            totalAmountPaid: 0,
            cashAmount: 0,
            upiAmount: 0,
          },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load real-time analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalPickupsToday = data?.statusDistribution
    ? Object.values(data.statusDistribution).reduce((a, b) => a + b, 0)
    : 0;

  const netWeightKg = data?.weightCollected?.netWeightGrams
    ? (data.weightCollected.netWeightGrams / 1000).toFixed(1)
    : '0';

  const totalPayout = data?.financials?.totalAmountPaid || 0;
  const activeOps = data?.activeEmployeesCount || 0;

  return (
    <div className="space-y-6">
      {/* Realtime Alert Banner if Pickups await dispatch */}
      {unassignedCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">
              ⚠️
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">
                {unassignedCount} Live Scrap Pickups Require Driver Assignment!
              </h3>
              <p className="text-xs text-amber-400/80">
                Customer requests submitted via mobile app are in queue awaiting field vehicle assignment.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('DISPATCH')}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all cursor-pointer shadow-md whitespace-nowrap"
          >
            Open Dispatch Queue →
          </button>
        </div>
      )}

      {/* Header bar with live refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-white">Operations Executive Snapshot</h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry aggregated from backend database, field scales, and dispatch queue
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Pickups */}
        <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Pickups</span>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-white mb-1">
            {loading ? '...' : totalPickupsToday}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {unassignedCount} unassigned in queue
          </div>
        </div>

        {/* Inward Scrap Weight */}
        <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inward Scrap Weight</span>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-teal-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 18h12l3-18H3z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-teal-400 mb-1">
            {loading ? '...' : `${netWeightKg} kg`}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Net weighed through IoT scales
          </div>
        </div>

        {/* Customer Payouts */}
        <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Payouts</span>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 mb-1 font-mono">
            {loading ? '...' : `₹${totalPayout.toLocaleString('en-IN')}`}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Cash & UPI settlements executed
          </div>
        </div>

        {/* Active Field Operations */}
        <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Field Ops</span>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-white mb-1">
            {loading ? '...' : activeOps}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Drivers currently on live route runs
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Dock */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
          Operations Command Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#1E293B]/70 border border-slate-800 flex flex-col justify-between">
            <div className="mb-3">
              <div className="text-sm font-bold text-white mb-0.5">Live Dispatch Queue</div>
              <div className="text-xs text-slate-400">Assign drivers & review slots</div>
            </div>
            <button
              onClick={() => onNavigateTab('DISPATCH')}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-md"
            >
              Dispatch Queue →
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#1E293B]/70 border border-slate-800 flex flex-col justify-between">
            <div className="mb-3">
              <div className="text-sm font-bold text-white mb-0.5">Scrap Rates & Margins</div>
              <div className="text-xs text-slate-400">Sync wholesale Mandi benchmarks</div>
            </div>
            <button
              onClick={() => onNavigateTab('RATES_MARGINS')}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-emerald-600 transition-all cursor-pointer"
            >
              Rate Engine →
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#1E293B]/70 border border-slate-800 flex flex-col justify-between">
            <div className="mb-3">
              <div className="text-sm font-bold text-white mb-0.5">Fleet & Logistics</div>
              <div className="text-xs text-slate-400">Vehicles, tare wt & payload</div>
            </div>
            <button
              onClick={() => onNavigateTab('FLEET')}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-emerald-600 transition-all cursor-pointer"
            >
              Fleet Ledger →
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#1E293B]/70 border border-slate-800 flex flex-col justify-between">
            <div className="mb-3">
              <div className="text-sm font-bold text-white mb-0.5">Cash Float & Field Crew</div>
              <div className="text-xs text-slate-400">Driver cash reconciliation desk</div>
            </div>
            <button
              onClick={() => onNavigateTab('WORKFORCE')}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-emerald-600 transition-all cursor-pointer"
            >
              Cash Float Desk →
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Order Status Distribution */}
      <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-1">Pickup Lifecycle Breakdown (Today)</h3>
        <p className="text-xs text-slate-400 mb-4">Live status distribution of pickups in database</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Requested', key: 'REQUESTED', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { label: 'Assigned', key: 'ASSIGNED', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'On The Way', key: 'ON_THE_WAY', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
            { label: 'Arrived / Weighing', key: 'ARRIVED', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { label: 'Completed', key: 'COMPLETED', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Cancelled', key: 'CANCELLED', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
          ].map((statusItem) => {
            const count = data?.statusDistribution?.[statusItem.key] || 0;
            return (
              <div key={statusItem.key} className={`p-3 rounded-xl border text-center ${statusItem.color}`}>
                <div className="text-lg font-black">{count}</div>
                <div className="text-[11px] font-semibold">{statusItem.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
