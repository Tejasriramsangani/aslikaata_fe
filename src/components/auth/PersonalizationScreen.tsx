"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit3, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../context/AuthContext';

interface PersonalizationScreenProps {
  onBack?: () => void;
  onComplete: () => void;
}

export const PersonalizationScreen: React.FC<PersonalizationScreenProps> = ({
  onBack,
  onComplete,
}) => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidName = fullName.trim().length >= 2;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValidName) {
      setErrorMessage('Please enter a valid full name (at least 2 characters).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.put('/customer/profile', {
        fullName: fullName.trim(),
      });

      if (res.success) {
        updateUser({ fullName: fullName.trim() });
        onComplete();
      } else {
        // Fallback: update local profile and proceed even if backend profile route responds with different wrapper
        updateUser({ fullName: fullName.trim() });
        onComplete();
      }
    } catch {
      // Local graceful fallback
      updateUser({ fullName: fullName.trim() });
      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-white flex flex-col justify-between p-6 overflow-hidden">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pt-2">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Personalize
        </span>
        <div className="w-10" />
      </div>

      {/* Main Avatar & Form Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
        {/* User Avatar Circle with Pencil Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-6"
        >
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#0A3D2B] to-[#145C42] p-1.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-emerald-100/40 flex items-center justify-center text-[#0A3D2B]">
              <User className="w-14 h-14 stroke-[2]" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-slate-950 flex items-center justify-center shadow-lg border-2 border-white absolute bottom-0 right-0">
            <Edit3 className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Headings */}
        <h2 className="text-2xl font-black text-slate-900 leading-tight">
          What's your name?
        </h2>
        <p className="text-xs text-slate-500 mt-2 px-4 leading-relaxed max-w-sm">
          This helps our doorstep pickup executives address you properly and personalizes your receipts.
        </p>

        {/* Name Input Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm mt-8 space-y-4">
          <div className="text-left">
            <label className="text-xs font-bold text-slate-700 block mb-1.5 px-1">
              Full name
            </label>
            <div className="relative flex items-center rounded-2xl bg-white border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A3D2B] focus-within:border-transparent transition-all overflow-hidden px-4 py-3.5">
              <input
                type="text"
                autoFocus
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. Vinay Palakonda"
                className="w-full text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Validation Error Banner */}
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-semibold text-rose-600 text-left px-1"
            >
              ⚠️ {errorMessage}
            </motion.p>
          )}
        </form>
      </div>

      {/* Bottom CTA Action Button */}
      <div className="pb-safe pt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!isValidName || isLoading}
          className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
            isValidName && !isLoading
              ? 'bg-[#0A3D2B] text-white shadow-emerald-950/20 hover:bg-[#0E4D36]'
              : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
