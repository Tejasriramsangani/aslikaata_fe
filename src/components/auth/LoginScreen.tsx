"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { BrandLogo } from '../common/BrandLogo';

interface LoginScreenProps {
  onBack?: () => void;
  onOtpSent: (mobileNumber: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onOtpSent }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidNumber = /^[6-9]\d{9}$/.test(mobileNumber.trim());

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValidNumber) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post('/auth/otp/send', {
        mobile: mobileNumber.trim(),
        purpose: 'LOGIN',
      });

      if (res.success) {
        onOtpSent(mobileNumber.trim());
      } else {
        setErrorMessage(res.error || 'Failed to send verification code. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while sending OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-white flex flex-col justify-between p-6 overflow-hidden">
      {/* Top Header Navigation */}
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
          Customer Login
        </span>
        <div className="w-10" />
      </div>

      {/* Main Form Area & Scene Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
        {/* Official Brand Logo */}
        <BrandLogo size="md" className="mb-3" />

        {/* Character with Scrap Truck Graphic */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-[240px] h-48 flex items-center justify-center mb-6"
        >
          <div className="absolute w-44 h-44 rounded-full bg-emerald-200/50 blur-2xl" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-40 h-28 rounded-3xl bg-gradient-to-tr from-[#0A3D2B] to-[#12583F] shadow-xl p-3 flex flex-col items-center justify-center border border-emerald-400/30">
              <Truck className="w-12 h-12 text-[#F59E0B]" />
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>ASLI KAATA VERIFIED</span>
              </div>
            </div>
            <div className="w-28 h-2.5 rounded-full bg-slate-300/50 blur-sm mt-2" />
          </div>
        </motion.div>

        {/* Headings */}
        <h2 className="text-2xl font-black text-slate-900 leading-tight">
          Enter your mobile number
        </h2>
        <p className="text-xs text-slate-500 mt-2 px-4 leading-relaxed max-w-sm">
          We'll send you a verification code to create or access your account seamlessly.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSendOtp} className="w-full max-w-sm mt-6 space-y-3">
          <div className="relative flex items-center rounded-2xl bg-white border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A3D2B] focus-within:border-transparent transition-all overflow-hidden">
            {/* Country Code Pill */}
            <div className="flex items-center gap-1 px-3.5 py-3.5 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-800 shrink-0">
              <span className="text-base">🇮🇳</span>
              <span>+91</span>
            </div>

            {/* Phone Input */}
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoFocus
              value={mobileNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) setMobileNumber(val);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="98765 43210"
              className="flex-1 px-3.5 py-3.5 text-sm font-bold text-slate-900 placeholder-slate-400 tracking-wider focus:outline-none bg-transparent"
            />

            {mobileNumber && (
              <button
                type="button"
                onClick={() => setMobileNumber('')}
                className="pr-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
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

          {/* Development Quick Hint */}
          <p className="text-[10px] text-slate-400 text-left px-1">
            💡 For local testing, any 10-digit number (e.g. 9876543210) works. OTP is logged to your backend console.
          </p>
        </form>
      </div>

      {/* Bottom CTA Action Button */}
      <div className="pb-safe pt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSendOtp}
          disabled={!isValidNumber || isLoading}
          className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
            isValidNumber && !isLoading
              ? 'bg-[#0A3D2B] text-white shadow-emerald-950/20 hover:bg-[#0E4D36]'
              : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Sending Code...</span>
            </>
          ) : (
            <span>Continue</span>
          )}
        </motion.button>
      </div>
    </div>
  );
};
