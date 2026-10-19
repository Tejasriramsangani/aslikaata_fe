"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import { ServerDownScreen } from '../components/common/ServerDownScreen';
import { AdminLoginScreen } from '../components/admin/AdminLoginScreen';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminDispatchQueueTab } from '../components/admin/AdminDispatchQueueTab';
import { AdminRatesMarginsTab } from '../components/admin/AdminRatesMarginsTab';
import { AdminFleetTab } from '../components/admin/AdminFleetTab';
import { AdminWorkforceFloatsTab } from '../components/admin/AdminWorkforceFloatsTab';
import { AdminYardInwardTab } from '../components/admin/AdminYardInwardTab';
import { AdminPlanningTab } from '../components/admin/AdminPlanningTab';
import { AdminAuditLogsTab } from '../components/admin/AdminAuditLogsTab';

export default function AdminPortalApp() {
  const [admin, setAdmin] = useState<{ id: string; email: string; roles: string[] } | null>(null);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [activeDivision, setActiveDivision] = useState<string>('VIJAYAWADA_MAIN');
  const [unassignedCount, setUnassignedCount] = useState<number>(3);
  const [isServerDown, setIsServerDown] = useState<boolean>(false);
  const [serverErrorDetails, setServerErrorDetails] = useState<string>('');
  const [isRetryingServer, setIsRetryingServer] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Check existing session on mount
  useEffect(() => {
    // 1. Health check
    apiClient.checkHealth().then((healthy) => {
      setIsServerDown(!healthy);
    });

    const unsub = apiClient.onServerStatusChange((down, details) => {
      setIsServerDown(down);
      if (details) setServerErrorDetails(details);
    });

    // 2. Auth check
    const savedProfile = apiClient.getAdminProfile();
    const token = apiClient.getAccessToken();

    if (savedProfile && token) {
      setAdmin(savedProfile);
    }

    setLoadingInitial(false);

    return () => unsub();
  }, []);

  const handleLoginSuccess = (authenticatedAdmin: { id: string; email: string; roles: string[] }) => {
    setAdmin(authenticatedAdmin);
  };

  const handleLogout = () => {
    apiClient.clearAdminTokens();
    setAdmin(null);
  };

  const handleRetryServer = async () => {
    setIsRetryingServer(true);
    await apiClient.checkHealth();
    setIsRetryingServer(false);
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Loading ASLI KAATA Operations Cockpit...
        </div>
      </div>
    );
  }

  // If user is not authenticated as Admin, show Enterprise Admin Login
  if (!admin) {
    return <AdminLoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Downtime Screen Overlay if backend goes down */}
      {isServerDown && (
        <ServerDownScreen
          onRetry={handleRetryServer}
          isRetrying={isRetryingServer}
          errorDetails={serverErrorDetails}
        />
      )}

      {/* Operations Header with Mobile Toggle Support */}
      <AdminHeader
        adminEmail={admin.email}
        activeDivision={activeDivision}
        onSelectDivision={setActiveDivision}
        unassignedCount={unassignedCount}
        onLogout={handleLogout}
        onNavigateTab={(tab) => {
          setActiveTab(tab as AdminTab);
          setIsMobileMenuOpen(false);
        }}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main ERP Layout: Responsive Sidebar + Operational Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar (Drawer on mobile, fixed column on desktop) */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          unassignedCount={unassignedCount}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Workspace Tab Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gradient-to-b from-[#0F172A] to-[#0A101D] w-full">
          <div className="w-full max-w-7xl mx-auto">
            {activeTab === 'OVERVIEW' && (
              <AdminOverviewTab
                onNavigateTab={(tab) => {
                  setActiveTab(tab as AdminTab);
                  setIsMobileMenuOpen(false);
                }}
                unassignedCount={unassignedCount}
              />
            )}

            {activeTab === 'DISPATCH' && (
              <AdminDispatchQueueTab
                onUnassignedCountChange={setUnassignedCount}
              />
            )}

            {activeTab === 'RATES_MARGINS' && <AdminRatesMarginsTab />}

            {activeTab === 'FLEET' && <AdminFleetTab />}

            {activeTab === 'WORKFORCE' && <AdminWorkforceFloatsTab />}

            {activeTab === 'YARD_INWARD' && <AdminYardInwardTab />}

            {activeTab === 'PLANNING' && <AdminPlanningTab />}

            {activeTab === 'AUDIT_LOGS' && <AdminAuditLogsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
