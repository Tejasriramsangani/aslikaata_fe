"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api-client';

interface AuditLogRecord {
  id: string;
  action: string;
  actorId: string;
  actorRole: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  createdAt: string;
}

export const AdminAuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getAuditLogs({ limit: '50' });
      if (res.success && Array.isArray(res.data?.logs || res.data)) {
        const rawLogs = res.data?.logs || res.data;
        const mapped: AuditLogRecord[] = rawLogs.map((l: any) => ({
          id: l._id || l.id,
          action: l.action || 'SYSTEM_ACTION',
          actorId: l.actorId || 'System',
          actorRole: l.actorRole || 'ADMIN',
          resource: l.resource || 'Entity',
          resourceId: l.resourceId,
          ipAddress: l.ipAddress || 'Internal Network',
          createdAt: l.createdAt ? new Date(l.createdAt).toLocaleString() : 'Recent',
        }));
        setLogs(mapped);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Immutable Operations Audit Trail</h2>
          <p className="text-xs text-slate-400">
            Cryptographic ledger of administrator actions, rate adjustments, KYC document accesses, and dispatch events
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Action & Time</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Actor ID</th>
                <th className="py-3.5 px-4">Affected Resource</th>
                <th className="py-3.5 px-4 font-mono">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading audit trail from database...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="text-3xl">📜</div>
                      <div className="font-bold text-white">No Audit Events Logged Yet</div>
                      <p className="text-[11px] text-slate-500">
                        When administrative actions, driver approvals, or rate changes occur, they will automatically be recorded here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-emerald-400">{log.action}</div>
                      <div className="text-[11px] text-slate-400">{log.createdAt}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 text-emerald-400">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{log.actorId}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {log.resource} {log.resourceId ? `(${log.resourceId})` : ''}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
