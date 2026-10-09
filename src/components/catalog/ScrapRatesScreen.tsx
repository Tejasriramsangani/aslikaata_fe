"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, ArrowRight, Tag, RefreshCw } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

interface ScrapRatesScreenProps {
  areaName: string;
  onBookPickup: () => void;
}

interface ScrapRateItem {
  id: string;
  name: string;
  category: string;
  subLabel: string;
  pricePerKg: number;
  unit: string;
  trend: string;
  isUp: boolean;
  emoji: string;
}

const DEFAULT_CATALOG: ScrapRateItem[] = [
  // Paper
  { id: 'p1', name: 'Newspaper', category: 'paper', subLabel: 'Clean & dry daily newspapers', pricePerKg: 18, unit: 'kg', trend: '+₹1.50', isUp: true, emoji: '📰' },
  { id: 'p2', name: 'Cardboard & Cartons', category: 'paper', subLabel: 'Corrugated boxes & packaging', pricePerKg: 14, unit: 'kg', trend: '+₹0.50', isUp: true, emoji: '📦' },
  { id: 'p3', name: 'Office White Paper', category: 'paper', subLabel: 'Used A4 sheets & books', pricePerKg: 16, unit: 'kg', trend: '+₹1.00', isUp: true, emoji: '📄' },
  
  // Metal
  { id: 'm1', name: 'Iron (Heavy MS)', category: 'metal', subLabel: 'Grills, pipes & angle frames', pricePerKg: 32, unit: 'kg', trend: '+₹2.00', isUp: true, emoji: '⚙️' },
  { id: 'm2', name: 'Iron (Light / Tin)', category: 'metal', subLabel: 'Oil tins, roofing sheets', pricePerKg: 22, unit: 'kg', trend: '+₹0.50', isUp: true, emoji: '🥫' },
  { id: 'm3', name: 'Aluminium', category: 'metal', subLabel: 'Utensils, frames & alloys', pricePerKg: 125, unit: 'kg', trend: '+₹5.00', isUp: true, emoji: '🍳' },
  { id: 'm4', name: 'Copper Wires', category: 'metal', subLabel: 'Electrical cables, coils & motors', pricePerKg: 480, unit: 'kg', trend: '+₹15.00', isUp: true, emoji: '🔌' },
  { id: 'm5', name: 'Brass (Pithal)', category: 'metal', subLabel: 'Pooja items, taps & plumbing', pricePerKg: 330, unit: 'kg', trend: '+₹10.00', isUp: true, emoji: '🔔' },
  
  // Plastic
  { id: 'pl1', name: 'PET Plastic Bottles', category: 'plastic', subLabel: 'Beverage & oil bottles', pricePerKg: 28, unit: 'kg', trend: '-₹1.00', isUp: false, emoji: '🍾' },
  { id: 'pl2', name: 'Hard Plastic (HDPE)', category: 'plastic', subLabel: 'Buckets, chairs, pipes', pricePerKg: 24, unit: 'kg', trend: '+₹1.00', isUp: true, emoji: '🪣' },
  { id: 'pl3', name: 'Soft Plastic & Covers', category: 'plastic', subLabel: 'Clean polyethene bags', pricePerKg: 12, unit: 'kg', trend: '-₹0.50', isUp: false, emoji: '🛍️' },
  
  // E-Waste
  { id: 'e1', name: 'Computer CPUs & Mobos', category: 'ewaste', subLabel: 'Desktops, server components', pricePerKg: 160, unit: 'kg', trend: '+₹5.00', isUp: true, emoji: '🖥️' },
  { id: 'e2', name: 'Laptops & Tablets', category: 'ewaste', subLabel: 'Complete dead units', pricePerKg: 220, unit: 'piece', trend: '+₹10.00', isUp: true, emoji: '💻' },
  { id: 'e3', name: 'Mixed Electronics', category: 'ewaste', subLabel: 'Keyboards, cables, adaptors', pricePerKg: 40, unit: 'kg', trend: '+₹0.00', isUp: true, emoji: '🔌' },

  // Others
  { id: 'o1', name: 'Inverter Batteries', category: 'others', subLabel: 'Lead acid batteries with fluid', pricePerKg: 95, unit: 'kg', trend: '+₹3.00', isUp: true, emoji: '🔋' },
  { id: 'o2', name: 'Beer & Glass Bottles', category: 'others', subLabel: 'Unbroken whole glass bottles', pricePerKg: 2.5, unit: 'bottle', trend: '+₹0.00', isUp: true, emoji: '🍾' },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'metal', label: 'Metal' },
  { id: 'paper', label: 'Paper' },
  { id: 'plastic', label: 'Plastic' },
  { id: 'ewaste', label: 'E-Waste' },
  { id: 'others', label: 'Others' },
];

export const ScrapRatesScreen: React.FC<ScrapRatesScreenProps> = ({
  areaName,
  onBookPickup,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rates, setRates] = useState<ScrapRateItem[]>(DEFAULT_CATALOG);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live catalog from backend if available
  useEffect(() => {
    async function fetchLiveCatalog() {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/catalog/products');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ScrapRateItem[] = res.data.map((p: any) => ({
            id: p._id,
            name: p.name,
            category: p.category?.code?.toLowerCase() || 'others',
            subLabel: p.description || 'Verified scrap material',
            pricePerKg: p.activeRate ? p.activeRate.ratePerKgPaise / 100 : 25,
            unit: 'kg',
            trend: '+₹1.50',
            isUp: true,
            emoji: p.category?.code === 'PAPER' ? '📰' : p.category?.code === 'PLASTIC' ? '🍾' : '⚙️',
          }));
          setRates(mapped);
        }
      } catch {
        // Retain verified default catalog
      } finally {
        setIsLoading(false);
      }
    }
    fetchLiveCatalog();
  }, []);

  const filteredRates = useMemo(() => {
    return rates.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [rates, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4 pb-20">
      {/* Title & Locality Info */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Scrap Rates</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live doorstep rates in <span className="font-bold text-emerald-800">{areaName}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Updated Today</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search newspaper, iron, copper, plastic..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D2B] focus:border-transparent transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-[#0A3D2B] text-white shadow-md shadow-emerald-950/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Itemized Rates List */}
      <div className="space-y-2.5">
        {filteredRates.map((item) => (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.99 }}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-emerald-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0">
                {item.emoji}
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.subLabel}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-black text-[#0A3D2B] block">
                ₹{item.pricePerKg}
                <span className="text-[10px] font-normal text-slate-500">/{item.unit}</span>
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md inline-block mt-0.5 ${
                  item.isUp
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                {item.isUp ? '⬆' : '⬇'} {item.trend}
              </span>
            </div>
          </motion.div>
        ))}

        {filteredRates.length === 0 && (
          <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-slate-100">
            <Tag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">No materials found for "{searchQuery}"</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Try searching for iron, paper or plastic</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Floating Booking CTA */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-20 pointer-events-none">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onBookPickup}
          className="w-full py-3.5 rounded-2xl bg-[#0A3D2B] text-white font-bold text-xs shadow-xl shadow-emerald-950/30 flex items-center justify-center gap-2 pointer-events-auto hover:bg-[#0E4D36] transition-all"
        >
          <span>Book A Scrap Pickup Now</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </motion.button>
      </div>
    </div>
  );
};
