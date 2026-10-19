"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api-client';

interface ScrapProductItem {
  id: string;
  name: string;
  categoryName: string;
  mandiBenchmark: string;
  marketRatePerKg: number;
  marginValue: number;
  customerRatePerKg: number;
  unit: string;
  lastUpdated?: string;
}

export const AdminRatesMarginsTab: React.FC = () => {
  const [products, setProducts] = useState<ScrapProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch real catalog from backend
  const fetchLiveCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getFullCatalog();
      if (res.success && res.data?.categories) {
        const flattened: ScrapProductItem[] = [];
        res.data.categories.forEach((cat: any) => {
          if (Array.isArray(cat.products)) {
            cat.products.forEach((prod: any) => {
              const currentRatePaise = prod.currentRate?.ratePerKgPaise || 0;
              const customerRate = currentRatePaise / 100;
              // Default benchmark estimate: market rate ~ customerRate + 15%
              const marketEst = customerRate > 0 ? parseFloat((customerRate * 1.15).toFixed(2)) : 50;
              const marginEst = parseFloat((marketEst - customerRate).toFixed(2));

              flattened.push({
                id: prod._id || prod.id,
                name: prod.name,
                categoryName: cat.name,
                mandiBenchmark: 'Mandi Wholesale Spot Index',
                marketRatePerKg: marketEst,
                marginValue: marginEst,
                customerRatePerKg: customerRate,
                unit: prod.unit || 'KG',
                lastUpdated: prod.currentRate?.effectiveFrom
                  ? new Date(prod.currentRate.effectiveFrom).toLocaleDateString()
                  : 'Live on Catalog',
              });
            });
          }
        });
        setProducts(flattened);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveCatalog();
  }, [fetchLiveCatalog]);

  const handleUpdateItem = (id: string, updates: Partial<ScrapProductItem>) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          const customerRate = Math.max(0, parseFloat((updated.marketRatePerKg - updated.marginValue).toFixed(2)));
          return { ...updated, customerRatePerKg: customerRate };
        }
        return item;
      })
    );
  };

  const handleBroadcastRates = async () => {
    setSaving(true);
    setStatusBanner(null);
    try {
      // Broadcast each rate to backend admin endpoint
      const promises = products.map((prod) =>
        apiClient.setProductRate({
          productId: prod.id,
          ratePerKgPaise: Math.round(prod.customerRatePerKg * 100),
          effectiveFrom: new Date().toISOString(),
        })
      );

      await Promise.all(promises);

      setStatusBanner({
        message: 'All scrap rates successfully updated and propagated to Customer App & Field Scales!',
        type: 'success',
      });
      await fetchLiveCatalog();
    } catch (err: any) {
      setStatusBanner({
        message: err.message || 'Failed to broadcast rates to backend.',
        type: 'error',
      });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusBanner(null), 5000);
    }
  };

  const handleSeedCatalog = async () => {
    setSeeding(true);
    try {
      const res = await apiClient.seedDefaultCatalog();
      if (res.success) {
        setStatusBanner({
          message: 'Default scrap categories, products, and rate tables seeded into database!',
          type: 'success',
        });
        await fetchLiveCatalog();
      } else {
        setStatusBanner({ message: res.error || 'Seeding failed.', type: 'error' });
      }
    } catch (err: any) {
      setStatusBanner({ message: err.message || 'Failed to initialize catalog.', type: 'error' });
    } finally {
      setSeeding(false);
      setTimeout(() => setStatusBanner(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Alert Banner */}
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
          <h2 className="text-lg font-black text-white">Dynamic Scrap Rates & Margin Engine</h2>
          <p className="text-xs text-slate-400">
            Real-time wholesale commodity Mandi rates synchronized with customer buying prices (<span className="text-emerald-400 font-mono font-bold">Customer Rate = Mandi Rate − Protected Margin</span>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {products.length === 0 && (
            <button
              onClick={handleSeedCatalog}
              disabled={seeding}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {seeding ? 'Seeding...' : '⚡ Seed Default Catalog'}
            </button>
          )}

          <button
            onClick={handleBroadcastRates}
            disabled={saving || products.length === 0}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            {saving ? (
              'Publishing Rates...'
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Broadcast to Customer App</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real Rates Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Commodity Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Wholesale Mandi Rate (₹/kg)</th>
                <th className="py-3.5 px-4">Protected Margin (₹/kg)</th>
                <th className="py-3.5 px-4">Final Customer Buying Price</th>
                <th className="py-3.5 px-4">Last Synced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading scrap products & rates from database...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="text-3xl">⚖️</div>
                      <div className="font-bold text-white">Scrap Catalog Empty in Database</div>
                      <p className="text-[11px] text-slate-500">
                        No scrap materials are published yet. Click the button below to automatically seed default materials (Copper, Brass, Iron, Paper OCC, Plastic PET, E-Waste).
                      </p>
                      <button
                        onClick={handleSeedCatalog}
                        disabled={seeding}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                      >
                        <span>Initialize Default Scrap Catalog</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Product Name */}
                    <td className="py-3.5 px-4 font-bold text-white">{item.name}</td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-400">{item.categoryName}</td>

                    {/* Mandi Wholesale Spot Input */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-mono text-xs">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          value={item.marketRatePerKg}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              marketRatePerKg: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-slate-400 text-[10px]">/{item.unit.toLowerCase()}</span>
                      </div>
                    </td>

                    {/* Margin Delta Input */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-400 font-mono font-bold">-</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-xs">₹</span>
                          <input
                            type="number"
                            step="0.5"
                            value={item.marginValue}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                marginValue: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-20 bg-[#0F172A] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">margin</span>
                      </div>
                    </td>

                    {/* Final Customer Rate */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-black text-sm">
                        <span>₹{item.customerRatePerKg}</span>
                        <span className="text-[10px] font-normal text-emerald-300">/{item.unit.toLowerCase()}</span>
                      </div>
                    </td>

                    {/* Last Synced */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {item.lastUpdated}
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
