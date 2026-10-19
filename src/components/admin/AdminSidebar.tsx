"use client";

import React from 'react';

export type AdminTab =
  | 'OVERVIEW'
  | 'DISPATCH'
  | 'RATES_MARGINS'
  | 'FLEET'
  | 'WORKFORCE'
  | 'YARD_INWARD'
  | 'PLANNING'
  | 'AUDIT_LOGS';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  unassignedCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  unassignedCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navSections = [
    {
      group: 'OPERATIONS',
      items: [
        {
          id: 'OVERVIEW' as AdminTab,
          label: 'Overview & KPIs',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
        },
        {
          id: 'DISPATCH' as AdminTab,
          label: 'Live Dispatch Queue',
          badge: unassignedCount > 0 ? unassignedCount : undefined,
          badgeColor: 'bg-amber-500 text-slate-950',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
        {
          id: 'YARD_INWARD' as AdminTab,
          label: 'Yard Inward Gate',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
      ],
    },
    {
      group: 'COMMERCIALS',
      items: [
        {
          id: 'RATES_MARGINS' as AdminTab,
          label: 'Scrap Rates & Margins',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ],
    },
    {
      group: 'LOGISTICS & HRM',
      items: [
        {
          id: 'FLEET' as AdminTab,
          label: 'Fleet & Vehicles',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          ),
        },
        {
          id: 'WORKFORCE' as AdminTab,
          label: 'Workforce & Cash Float',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
      ],
    },
    {
      group: 'GOVERNANCE',
      items: [
        {
          id: 'PLANNING' as AdminTab,
          label: 'Holiday & Shift Calendar',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          id: 'AUDIT_LOGS' as AdminTab,
          label: 'Realtime Audit Logs',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const handleItemClick = (id: AdminTab) => {
    onSelectTab(id);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 z-40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar: Static on Desktop (lg), Off-canvas Slide-over on Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B132B] border-r border-slate-800 flex flex-col shrink-0 select-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-64 lg:min-h-[calc(100vh-4rem)] ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white">OPERATIONS MENU</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 flex-1 space-y-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.group}>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 mb-2">
                {section.group}
              </div>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                            item.badgeColor || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Yard Operations Status Card */}
        <div className="p-4 border-t border-slate-800 bg-[#080E21]">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-300">Yard Status</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                OPEN
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Weighbridge: <span className="text-white font-medium">Calibrated (100t)</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Vault Float: <span className="text-emerald-400 font-medium">₹2,45,000</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
