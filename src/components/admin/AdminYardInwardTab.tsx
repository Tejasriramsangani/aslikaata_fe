"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api-client';

interface GateEntry {
  id: string;
  ticketNumber: string;
  sellerName: string;
  sellerType: string;
  vehicleOrCart: string;
  material: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  ratePerKg: number;
  totalPayout: number;
  paymentMode: 'CASH' | 'UPI';
  timestamp: string;
}

export const AdminYardInwardTab: React.FC = () => {
  const [entries, setEntries] = useState<GateEntry[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; ratePerKg: number }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNewEntry, setShowNewEntry] = useState(false);

  // Form states
  const [sellerName, setSellerName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [vehicleOrCart, setVehicleOrCart] = useState('Weighbridge Walk-In');
  const [grossWeight, setGrossWeight] = useState('');
  const [tareWeight, setTareWeight] = useState('');
  const [rate, setRate] = useState('30');
  const [payMode, setPayMode] = useState<'CASH' | 'UPI'>('CASH');

  const netWeight = Math.max(0, (parseFloat(grossWeight) || 0) - (parseFloat(tareWeight) || 0));
  const totalPayout = netWeight * (parseFloat(rate) || 0);

  const fetchCatalogProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getFullCatalog();
      if (res.success && res.data?.categories) {
        const prodList: Array<{ id: string; name: string; ratePerKg: number }> = [];
        res.data.categories.forEach((cat: any) => {
          if (Array.isArray(cat.products)) {
            cat.products.forEach((p: any) => {
              const customerRate = (p.currentRate?.ratePerKgPaise || 3000) / 100;
              prodList.push({
                id: p._id || p.id,
                name: p.name,
                ratePerKg: customerRate,
              });
            });
          }
        });
        setProducts(prodList);
        if (prodList.length > 0) {
          setSelectedProduct(prodList[0].name);
          setRate(prodList[0].ratePerKg.toString());
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCatalogProducts();
  }, [fetchCatalogProducts]);

  const handleProductChange = (prodName: string) => {
    setSelectedProduct(prodName);
    const found = products.find((p) => p.name === prodName);
    if (found) {
      setRate(found.ratePerKg.toString());
    }
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName || netWeight <= 0) return;

    const newTicket: GateEntry = {
      id: `gate_${Date.now()}`,
      ticketNumber: `GATE-${new Date().getFullYear()}-${String(entries.length + 1).padStart(4, '0')}`,
      sellerName,
      sellerType: 'WALK_IN_SELLER',
      vehicleOrCart,
      material: selectedProduct || 'Scrap Material',
      grossWeightKg: parseFloat(grossWeight) || 0,
      tareWeightKg: parseFloat(tareWeight) || 0,
      netWeightKg: netWeight,
      ratePerKg: parseFloat(rate) || 0,
      totalPayout,
      paymentMode: payMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setEntries([newTicket, ...entries]);
    setShowNewEntry(false);
    setSellerName('');
    setGrossWeight('');
    setTareWeight('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Yard Gate Inward Scrap Weighbridge</h2>
          <p className="text-xs text-slate-400">
            Direct walk-in scrap intake for local scrap collectors, tricycles, and dealer auto trolleys
          </p>
        </div>

        <button
          onClick={() => setShowNewEntry(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Gate Weighbridge Ticket</span>
        </button>
      </div>

      {/* Weighbridge Live Calibration Indicator */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="font-bold text-white">Weighbridge #01 (100-Tonne Pitless Platform): </span>
            <span className="text-emerald-400 font-mono font-bold">Zero Balanced (0.0 kg)</span>
          </div>
        </div>
        <div className="text-slate-400">Legal Metrology Certificate: <span className="text-slate-200">VALID</span></div>
      </div>

      {/* Tickets Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Ticket # & Time</th>
                <th className="py-3.5 px-4">Seller Details</th>
                <th className="py-3.5 px-4">Material Intake</th>
                <th className="py-3.5 px-4">Gross / Tare</th>
                <th className="py-3.5 px-4">Net Scrap Weight</th>
                <th className="py-3.5 px-4">Rate & Payout</th>
                <th className="py-3.5 px-4">Payment Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="text-3xl">⚖️</div>
                      <div className="font-bold text-white">No Gate Tickets Logged Today</div>
                      <p className="text-[11px] text-slate-500">
                        When local dealers or scavengers deliver scrap directly to the yard weighbridge, click 'New Gate Weighbridge Ticket' above to record and pay.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-emerald-400">{g.ticketNumber}</div>
                      <div className="text-[11px] text-slate-400">{g.timestamp}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{g.sellerName}</div>
                      <div className="text-[10px] text-slate-400">{g.vehicleOrCart}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{g.material}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>Gross: {g.grossWeightKg}kg</div>
                      <div className="text-slate-400 text-[10px]">Tare: {g.tareWeightKg}kg</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-sm text-emerald-400">
                      {g.netWeightKg} kg
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-black text-white">₹{g.totalPayout.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@ ₹{g.ratePerKg}/kg</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          g.paymentMode === 'CASH'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-cyan-500/15 text-cyan-400'
                        }`}
                      >
                        {g.paymentMode}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {showNewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">New Gate Inward Entry</h3>
              <button onClick={() => setShowNewEntry(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Seller / Dealer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venkat (Auto Trolley)"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Scrap Material (from Catalog)</label>
                {products.length === 0 ? (
                  <input
                    type="text"
                    required
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    placeholder="Iron Scrap (M.S.)"
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <select
                    value={selectedProduct}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} (Live Rate: ₹{p.ratePerKg}/kg)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Gross Wt (kg)</label>
                  <input
                    type="number"
                    required
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tare Wt (kg)</label>
                  <input
                    type="number"
                    required
                    value={tareWeight}
                    onChange={(e) => setTareWeight(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Rate (₹/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as any)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="CASH">Cash (from Yard Vault)</option>
                    <option value="UPI">UPI Instant Settlement</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Net Scrap:</span>
                  <span className="font-mono font-bold text-emerald-400">{netWeight} kg</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1">
                  <span>Total Payout:</span>
                  <span className="font-mono text-emerald-400">₹{totalPayout.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewEntry(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 cursor-pointer shadow-md"
                >
                  Print Weigh Slip & Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
