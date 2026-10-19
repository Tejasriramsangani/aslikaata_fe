"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client';

interface AdminHeaderProps {
  adminEmail: string;
  activeDivision: string;
  onSelectDivision: (div: string) => void;
  unassignedCount: number;
  onLogout: () => void;
  onNavigateTab: (tabId: string) => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminEmail,
  activeDivision,
  onSelectDivision,
  unassignedCount,
  onLogout,
  onNavigateTab,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isServerHealthy, setIsServerHealthy] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    apiClient.checkHealth().then(setIsServerHealthy);
    const unsubscribe = apiClient.onServerStatusChange((isDown) => {
      setIsServerHealthy(!isDown);
    });
    return unsubscribe;
  }, []);

  return (
    <header className="h-16 w-full bg-[#0F172A] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-md">
      {/* Left: Mobile Hamburger Toggle + Brand & Division Selector */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer transition-colors"
          aria-label="Toggle navigation drawer"
        >
          {isMobileMenuOpen ? (
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0A3D2B] via-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-950 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black tracking-tight text-white uppercase whitespace-nowrap">
                ASLI <span className="text-emerald-400">KAATA</span>
              </span>
              <span className="hidden sm:inline text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ERP
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-slate-400 leading-none">Operations Cockpit</p>
          </div>
        </div>

        {/* Division Hub Dropdown */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hub:</span>
          <select
            value={activeDivision}
            onChange={(e) => onSelectDivision(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
          >
            <option value="VIJAYAWADA_MAIN">Vijayawada Main Yard & Baling Plant (Zone A)</option>
            <option value="GUNTUR_CENTRAL">Guntur Central Processing Hub</option>
            <option value="HYDERABAD_SOUTH">Hyderabad South Industrial Belt Hub</option>
            <option value="ALL_DIVISIONS">All Regional Hubs (Pan-State View)</option>
          </select>
        </div>
      </div>

      {/* Right: Server Pulse, Clock, Alerts, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live IST Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 text-xs font-mono">
          <span className="text-slate-500 text-[10px]">IST:</span>
          <span className="font-semibold text-emerald-400">{currentTime || '12:00:00 PM'}</span>
        </div>

        {/* Real-time Server Health Indicator */}
        <div
          title={isServerHealthy ? 'Backend API Gateway Connected' : 'Server Down / Reconnecting'}
          className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
            isServerHealthy
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
              : 'bg-rose-950/40 text-rose-400 border-rose-800/50 animate-pulse'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isServerHealthy ? 'bg-emerald-400' : 'bg-rose-500'}`} />
          <span className="hidden sm:inline">{isServerHealthy ? 'Gateway Live' : 'Server Down'}</span>
        </div>

        {/* Unassigned Urgent Pickups Alert Badge */}
        <button
          onClick={() => onNavigateTab('DISPATCH')}
          className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
            unassignedCount > 0
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title={`${unassignedCount} pickups awaiting driver assignment`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unassignedCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
              {unassignedCount}
            </span>
          )}
        </button>

        {/* Super Admin Profile Pill & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shrink-0">
              SA
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-white leading-tight">Super Admin</div>
              <div className="text-[10px] text-slate-400 leading-tight">{adminEmail}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign out of Admin Operations"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
