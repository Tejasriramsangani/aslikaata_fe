"use client";

import React, { useState, useEffect } from 'react';
import { ServerOff, RefreshCw, WifiOff, PhoneCall, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';

interface ServerDownScreenProps {
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
  errorDetails?: string;
  autoRetrySeconds?: number;
}

export const ServerDownScreen: React.FC<ServerDownScreenProps> = ({
  onRetry,
  isRetrying = false,
  errorDetails = 'Unable to connect to ASLI KAATA ERP API Server',
  autoRetrySeconds = 10,
}) => {
  const [countdown, setCountdown] = useState<number>(autoRetrySeconds);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  useEffect(() => {
    if (isRetrying) return;
    if (countdown <= 0) {
      onRetry();
      setCountdown(autoRetrySeconds);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, isRetrying, onRetry, autoRetrySeconds]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col justify-between p-8 select-none overflow-hidden">
      {/* Background Operations Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm">
            AK
          </div>
          <span className="font-bold text-sm tracking-wide text-slate-200">
            ASLI KAATA Operations Cockpit
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>API Cluster Disconnected</span>
        </div>
      </div>

      {/* Center Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-6 max-w-lg mx-auto">
        <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping duration-1000" />
          <div className="absolute inset-4 rounded-full border border-teal-500/30 animate-pulse" />
          <div className="absolute inset-8 rounded-full bg-slate-900 border border-slate-800 shadow-2xl" />

          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ServerOff className="w-8 h-8 text-slate-950 stroke-[2.2]" />
          </div>

          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-red-500 border-2 border-slate-950 flex items-center justify-center text-white shadow-md">
            <WifiOff className="w-4 h-4" />
          </div>
        </div>

        <h2 className="text-3xl font-black tracking-tight text-white mb-2">
          Operations Backend Unreachable
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mb-6">
          The operations server is temporarily offline, warming up from idle standby, or performing database maintenance. Real-time fleet tracking and ledger sync will resume automatically once connected.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-medium">
          <Activity className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>
            {isRetrying ? 'Pinging cluster health...' : `Auto-reconnecting in ${countdown}s`}
          </span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="relative z-10 space-y-3 max-w-md mx-auto w-full pb-4">
        <button
          onClick={() => onRetry()}
          disabled={isRetrying}
          className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Attempting Connection...' : 'Reconnect Cluster Now'}</span>
        </button>

        <div className="text-center">
          <button
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="text-xs text-slate-500 hover:text-slate-300 underline transition cursor-pointer"
          >
            {showDiagnostics ? 'Hide Cluster Telemetry' : 'Show Cluster Telemetry'}
          </button>

          {showDiagnostics && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left font-mono space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cluster Diagnostics</span>
              </div>
              <p>Target: {errorDetails}</p>
              <p>Failover Mode: Active</p>
              <p>Timestamp: {new Date().toISOString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
