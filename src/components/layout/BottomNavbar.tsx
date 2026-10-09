"use client";

import React from 'react';
import { Home, TrendingUp, Plus, PackageCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';

export type NavTab = 'home' | 'rates' | 'request' | 'pickups' | 'profile';

interface BottomNavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingCount?: number;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  activeTab,
  onTabChange,
  pendingCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-3 py-2 pb-safe">
      <div className="flex items-center justify-between relative">
        {/* Tab 1: Home */}
        <button
          onClick={() => onTabChange('home')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group"
        >
          <div className="relative">
            <Home
              className={`w-6 h-6 transition-colors ${
                activeTab === 'home'
                  ? 'text-[#0A3D2B] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            {activeTab === 'home' && (
              <motion.div
                layoutId="nav-dot"
                className="w-1.5 h-1.5 rounded-full bg-[#0A3D2B] mx-auto mt-1"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 font-medium transition-colors ${
              activeTab === 'home' ? 'text-[#0A3D2B] font-bold' : 'text-slate-500'
            }`}
          >
            Home
          </span>
        </button>

        {/* Tab 2: Scrap Rates */}
        <button
          onClick={() => onTabChange('rates')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group"
        >
          <div className="relative">
            <TrendingUp
              className={`w-6 h-6 transition-colors ${
                activeTab === 'rates'
                  ? 'text-[#0A3D2B] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            {activeTab === 'rates' && (
              <motion.div
                layoutId="nav-dot"
                className="w-1.5 h-1.5 rounded-full bg-[#0A3D2B] mx-auto mt-1"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 font-medium transition-colors ${
              activeTab === 'rates' ? 'text-[#0A3D2B] font-bold' : 'text-slate-500'
            }`}
          >
            Scrap Rates
          </span>
        </button>

        {/* Tab 3: Center Elevated Action (+ Request) */}
        <div className="flex-1 flex flex-col items-center -mt-6">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onTabChange('request')}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all border-4 border-white ${
              activeTab === 'request'
                ? 'bg-gradient-to-tr from-[#062418] to-[#0E4D36] shadow-[0_8px_20px_rgba(10,61,43,0.45)] ring-2 ring-[#F59E0B]'
                : 'bg-gradient-to-tr from-[#0A3D2B] to-[#12583F] shadow-[0_6px_16px_rgba(10,61,43,0.35)]'
            }`}
          >
            <Plus className="w-7 h-7 text-[#F59E0B] stroke-[3]" />
          </motion.button>
          <span className="text-[10px] font-bold text-[#0A3D2B] mt-0.5">
            + Request
          </span>
        </div>

        {/* Tab 4: My Pickups */}
        <button
          onClick={() => onTabChange('pickups')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group relative"
        >
          <div className="relative">
            <PackageCheck
              className={`w-6 h-6 transition-colors ${
                activeTab === 'pickups'
                  ? 'text-[#0A3D2B] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#E11D48] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {pendingCount}
              </span>
            )}
            {activeTab === 'pickups' && (
              <motion.div
                layoutId="nav-dot"
                className="w-1.5 h-1.5 rounded-full bg-[#0A3D2B] mx-auto mt-1"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 font-medium transition-colors ${
              activeTab === 'pickups' ? 'text-[#0A3D2B] font-bold' : 'text-slate-500'
            }`}
          >
            My Pickups
          </span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group"
        >
          <div className="relative">
            <User
              className={`w-6 h-6 transition-colors ${
                activeTab === 'profile'
                  ? 'text-[#0A3D2B] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            {activeTab === 'profile' && (
              <motion.div
                layoutId="nav-dot"
                className="w-1.5 h-1.5 rounded-full bg-[#0A3D2B] mx-auto mt-1"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 font-medium transition-colors ${
              activeTab === 'profile' ? 'text-[#0A3D2B] font-bold' : 'text-slate-500'
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
