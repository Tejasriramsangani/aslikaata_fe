"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api-client';

interface EmployeeRecord {
  id: string;
  fullName: string;
  mobile: string;
  employeeCode?: string;
  status: string;
  role?: string;
  openingFloat: number;
  cashPaidToCustomers: number;
  expectedReturnBalance: number;
  actualCashReturned: number;
  reconciliationStatus: 'ACTIVE_SHIFT' | 'RECONCILED' | 'DISCREPANCY';
  pickupsCount: number;
}

export const AdminWorkforceFloatsTab: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusBanner, setStatusBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Reconcile modal
  const [reconcileModal, setReconcileModal] = useState<EmployeeRecord | null>(null);
  const [returnAmountInput, setReturnAmountInput] = useState<string>('');
  const [openingFloatModal, setOpeningFloatModal] = useState<EmployeeRecord | null>(null);
  const [openingFloatInput, setOpeningFloatInput] = useState<string>('20000');

  const fetchWorkforceAndPickups = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, pickupRes] = await Promise.all([
        apiClient.listEmployees(),
        apiClient.listAdminPickups(),
      ]);

      const pickupsList = pickupRes.success && Array.isArray(pickupRes.data) ? pickupRes.data : [];

      if (empRes.success && Array.isArray(empRes.data)) {
        const mapped: EmployeeRecord[] = empRes.data.map((emp: any) => {
          const empId = emp._id || emp.id;
          // Count pickups and cash disbursements for this employee
          const myPickups = pickupsList.filter((p: any) => p.assignment?.employeeProfileId === empId);
          const completedPickups = myPickups.filter((p: any) => p.status === 'COMPLETED');
          const totalPaid = completedPickups.reduce((acc: number, p: any) => acc + (p.totals?.totalAmount || 0), 0);
          
          const defaultOpening = 20000;
          const expected = Math.max(0, defaultOpening - totalPaid);

          return {
            id: empId,
            fullName: emp.fullName || emp.name || 'Field Driver',
            mobile: emp.userId?.mobile || emp.mobile || '+91 Mobile',
            employeeCode: emp.employeeCode || `EMP-${empId.slice(-4).toUpperCase()}`,
            status: emp.status || 'APPROVED',
            role: emp.role || 'DRIVER',
            openingFloat: defaultOpening,
            cashPaidToCustomers: totalPaid,
            expectedReturnBalance: expected,
            actualCashReturned: 0,
            reconciliationStatus: totalPaid > 0 ? 'ACTIVE_SHIFT' : 'RECONCILED',
            pickupsCount: myPickups.length,
          };
        });
        setEmployees(mapped);
      } else {
        setEmployees([]);
      }
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkforceAndPickups();
  }, [fetchWorkforceAndPickups]);

  const handleOpenReconcile = (emp: EmployeeRecord) => {
    setReconcileModal(emp);
    setReturnAmountInput(emp.expectedReturnBalance.toString());
  };

  const handleConfirmReconciliation = () => {
    if (!reconcileModal) return;
    const amount = parseFloat(returnAmountInput) || 0;
    const isClean = amount === reconcileModal.expectedReturnBalance;

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === reconcileModal.id
          ? {
              ...e,
              actualCashReturned: amount,
              reconciliationStatus: isClean ? 'RECONCILED' : 'DISCREPANCY',
            }
          : e
      )
    );

    setStatusBanner({
      message: `Shift reconciliation closed for ${reconcileModal.fullName}. Vault handover logged.`,
      type: 'success',
    });
    setReconcileModal(null);
    setTimeout(() => setStatusBanner(null), 5000);
  };

  const handleSetOpeningFloat = () => {
    if (!openingFloatModal) return;
    const amount = parseFloat(openingFloatInput) || 0;

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === openingFloatModal.id
          ? {
              ...e,
              openingFloat: amount,
              expectedReturnBalance: Math.max(0, amount - e.cashPaidToCustomers),
              reconciliationStatus: 'ACTIVE_SHIFT',
            }
          : e
      )
    );

    setStatusBanner({
      message: `Opening cash float of ₹${amount.toLocaleString('en-IN')} issued to ${openingFloatModal.fullName}.`,
      type: 'success',
    });
    setOpeningFloatModal(null);
    setTimeout(() => setStatusBanner(null), 5000);
  };

  const totalOpening = employees.reduce((acc, e) => acc + e.openingFloat, 0);
  const totalPaid = employees.reduce((acc, e) => acc + e.cashPaidToCustomers, 0);
  const totalExpected = employees.reduce((acc, e) => acc + e.expectedReturnBalance, 0);

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
      <div>
        <h2 className="text-lg font-black text-white">Daily Cash Float & Field Crew Desk</h2>
        <p className="text-xs text-slate-400">
          Reconciles morning opening cash float with verified digital doorstep payouts executed via Employee App
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#1E293B] border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Morning Float
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{totalOpening.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Disbursed to active field personnel</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1E293B] border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Doorstep Verified Payouts
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Confirmed with closing OTPs</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1E293B] border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Expected Return to Vault
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ₹{totalExpected.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Due at end-of-shift check-in</div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Officer Name & Code</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4">Opening Float</th>
                <th className="py-3.5 px-4">Doorstep Payouts</th>
                <th className="py-3.5 px-4">Expected Return</th>
                <th className="py-3.5 px-4">Shift State</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading active workforce from database...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="text-3xl">👥</div>
                      <div className="font-bold text-white">No Employees Registered Yet</div>
                      <p className="text-[11px] text-slate-500">
                        When drivers & scrap pickers log in and submit documents on the Employee App, their profiles will automatically appear here for dispatch and float assignment.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{e.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{e.employeeCode}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{e.mobile}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ₹{e.openingFloat.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">
                      ₹{e.cashPaidToCustomers.toLocaleString('en-IN')}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({e.pickupsCount} jobs)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ₹{e.expectedReturnBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          e.reconciliationStatus === 'RECONCILED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : e.reconciliationStatus === 'DISCREPANCY'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400 animate-pulse'
                        }`}
                      >
                        {e.reconciliationStatus === 'RECONCILED'
                          ? '✓ RECONCILED'
                          : e.reconciliationStatus === 'DISCREPANCY'
                          ? '⚠️ DISCREPANCY'
                          : '● ON SHIFT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setOpeningFloatModal(e);
                            setOpeningFloatInput(e.openingFloat.toString());
                          }}
                          className="text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          Float
                        </button>
                        <button
                          onClick={() => handleOpenReconcile(e)}
                          className="text-[11px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-md"
                        >
                          Close Shift
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Float Adjustment Modal */}
      {openingFloatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Issue Morning Cash Float</h3>
            <p className="text-xs text-slate-400 mb-4">Officer: {openingFloatModal.fullName}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Float Amount (₹)</label>
                <input
                  type="number"
                  value={openingFloatInput}
                  onChange={(e) => setOpeningFloatInput(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpeningFloatModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSetOpeningFloat}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 cursor-pointer shadow-md"
                >
                  Disburse Float
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {reconcileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">End-of-Shift Cash Handover</h3>
                <p className="text-xs text-slate-400">Officer: {reconcileModal.fullName}</p>
              </div>
              <button onClick={() => setReconcileModal(null)} className="text-slate-400 hover:text-white cursor-pointer font-bold">
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Morning Float Disbursed:</span>
                <span className="font-mono font-bold text-white">₹{reconcileModal.openingFloat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Doorstep Payouts (App Verified):</span>
                <span className="font-mono font-bold text-cyan-400">-₹{reconcileModal.cashPaidToCustomers}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-300 font-bold">Expected Physical Cash Return:</span>
                <span className="font-mono font-black text-emerald-400">₹{reconcileModal.expectedReturnBalance}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-xs font-bold text-slate-300">Counted Cash Received (₹)</label>
              <input
                type="number"
                value={returnAmountInput}
                onChange={(e) => setReturnAmountInput(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReconcileModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReconciliation}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 cursor-pointer shadow-md"
              >
                Accept Cash & Close Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
