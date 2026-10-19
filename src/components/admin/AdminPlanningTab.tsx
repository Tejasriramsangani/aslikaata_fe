"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api-client';

interface HolidayItem {
  id: string;
  name: string;
  date: string;
  description?: string;
  isRegional?: boolean;
}

interface ScheduleItem {
  id: string;
  divisionId?: string;
  dayOfWeek: number;
  timeSlotId?: string;
  maxStops?: number;
}

export const AdminPlanningTab: React.FC = () => {
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showAddHoliday, setShowAddHoliday] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  const fetchPlanningData = useCallback(async () => {
    setLoading(true);
    try {
      const [holRes, schedRes] = await Promise.all([
        apiClient.listHolidays(),
        apiClient.listRouteSchedules(),
      ]);

      if (holRes.success && Array.isArray(holRes.data)) {
        const mappedHols: HolidayItem[] = holRes.data.map((h: any) => ({
          id: h._id || h.id,
          name: h.name || 'Declared Holiday',
          date: h.date ? new Date(h.date).toISOString().split('T')[0] : '',
          description: h.description,
          isRegional: h.isRegional,
        }));
        setHolidays(mappedHols);
      } else {
        setHolidays([]);
      }

      if (schedRes.success && Array.isArray(schedRes.data)) {
        const mappedSched: ScheduleItem[] = schedRes.data.map((s: any) => ({
          id: s._id || s.id,
          dayOfWeek: s.dayOfWeek || 1,
          maxStops: s.maxStops,
        }));
        setSchedules(mappedSched);
      } else {
        setSchedules([]);
      }
    } catch {
      setHolidays([]);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanningData();
  }, [fetchPlanningData]);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim() || !holidayDate) return;

    setSaving(true);
    try {
      const res = await apiClient.createHoliday({
        name: holidayName.trim(),
        date: holidayDate,
      });

      if (res.success) {
        setStatusBanner({
          message: `Operational Holiday '${holidayName}' successfully added to calendar. Pickups on this date will be auto-shifted.`,
          type: 'success',
        });
        setShowAddHoliday(false);
        setHolidayName('');
        setHolidayDate('');
        await fetchPlanningData();
      } else {
        setStatusBanner({ message: res.error || 'Failed to add holiday.', type: 'error' });
      }
    } catch (err: any) {
      setStatusBanner({ message: err.message || 'Error communicating with holiday service.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusBanner(null), 5000);
    }
  };

  const getDayName = (dayNum: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || `Day ${dayNum}`;
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
          <span>✓ {statusBanner.message}</span>
          <button onClick={() => setStatusBanner(null)} className="cursor-pointer font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Operations Planning, Holidays & Route Matrix</h2>
          <p className="text-xs text-slate-400">
            Regional operational calendar, automated route shifting rules, and weekly zone schedules
          </p>
        </div>

        <button
          onClick={() => setShowAddHoliday(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Declare Operational Holiday</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holidays */}
        <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Declared Operational Holidays</h3>
              <p className="text-xs text-slate-400">Pickup slots disabled / auto-shifted on these dates</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Loading holidays from database...
              </div>
            ) : holidays.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No operational holidays declared. Pickup slots are active every day.
              </div>
            ) : (
              holidays.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{h.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{h.date}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    SLOTS CLOSED
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Route Schedules */}
        <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Route Schedule Matrix</h3>
              <p className="text-xs text-slate-400">Configured zone operational days</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              ACTIVE
            </span>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Loading route schedules...
              </div>
            ) : schedules.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <div className="text-2xl mb-1">📅</div>
                Standard daily operational coverage across all active hub divisions.
              </div>
            ) : (
              schedules.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-white">{getDayName(s.dayOfWeek)}</span>
                  <span className="font-mono text-emerald-400 text-[11px]">
                    Max {s.maxStops || 15} stops / route
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {showAddHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Declare Operational Holiday</h3>
              <button onClick={() => setShowAddHoliday(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Holiday Name / Occasion</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sankranti, Republic Day"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHoliday(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add to Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
