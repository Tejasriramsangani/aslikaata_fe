"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../context/AuthContext';

interface OtpVerificationScreenProps {
  mobileNumber: string;
  onBack: () => void;
  onEditMobile: () => void;
  onSuccess: (isNewUser: boolean) => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  mobileNumber,
  onBack,
  onEditMobile,
  onSuccess,
}) => {
  const { login } = useAuth();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 30s Countdown Timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-focus first input box
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const updated = [...otp];
      updated[index] = '';
      setOtp(updated);
      return;
    }

    // Single digit input
    const char = cleanVal.slice(-1);
    const updated = [...otp];
    updated[index] = char;
    setOtp(updated);
    if (errorMessage) setErrorMessage(null);

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // If 6 digits filled, trigger verification
      const fullCode = [...updated].join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData.length === 6) {
      const splitArr = pasteData.split('');
      setOtp(splitArr);
      inputRefs.current[5]?.focus();
      handleVerify(pasteData);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otp.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post('/auth/otp/verify', {
        mobile: mobileNumber,
        code: fullCode,
        purpose: 'LOGIN',
        requestedRole: 'CUSTOMER',
      });

      if (res.success && res.data) {
        const { accessToken, refreshToken, user } = res.data;
        login(accessToken, refreshToken, {
          _id: user._id,
          mobileNumber: user.mobile || mobileNumber,
          fullName: user.profile?.fullName,
          isVerified: true,
        });

        // If user already has fullName configured, skip personalization
        const isNewUser = !user.profile?.fullName;
        onSuccess(isNewUser);
      } else {
        setErrorMessage(res.error || 'Invalid OTP code. Please check and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error verifying code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post('/auth/otp/send', {
        mobile: mobileNumber,
        purpose: 'LOGIN',
      });

      if (res.success) {
        setTimer(30);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setErrorMessage(res.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error.');
    } finally {
      setIsResending(false);
    }
  };

  const isFull = otp.every((d) => d !== '');

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-white flex flex-col justify-between p-6 overflow-hidden">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Verification
        </span>
        <div className="w-10" />
      </div>

      {/* Main Form Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
        {/* OTP Graphic Icon */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-[200px] h-36 flex items-center justify-center mb-4"
        >
          <div className="absolute w-36 h-36 rounded-full bg-emerald-200/50 blur-2xl" />
          <div className="relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#0A3D2B] to-[#12583F] shadow-xl p-3 flex flex-col items-center justify-center border border-emerald-400/30">
            <KeyRound className="w-10 h-10 text-[#F59E0B]" />
            <span className="text-[10px] font-black text-white tracking-widest mt-1">123456</span>
          </div>
        </motion.div>

        {/* Headings */}
        <h2 className="text-2xl font-black text-slate-900 leading-tight">
          Enter the OTP
        </h2>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <p className="text-xs text-slate-500">
            We've sent a 6-digit code to <span className="font-bold text-slate-800">+91 {mobileNumber}</span>
          </p>
          <button
            onClick={onEditMobile}
            className="text-emerald-700 hover:text-emerald-900 p-1"
            aria-label="Edit mobile number"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Square Inputs */}
        <div className="mt-8 flex items-center justify-center gap-2.5">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-lg font-black rounded-2xl bg-white border-2 shadow-sm transition-all focus:outline-none ${
                digit
                  ? 'border-[#0A3D2B] text-[#0A3D2B] bg-emerald-50/30 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 text-slate-900 focus:border-[#0A3D2B]'
              }`}
            />
          ))}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-semibold text-rose-600 mt-4 px-2"
          >
            ⚠️ {errorMessage}
          </motion.p>
        )}

        {/* Resend OTP Timer & Button */}
        <div className="mt-6 text-xs text-slate-500">
          {timer > 0 ? (
            <p>
              Resend OTP in{' '}
              <span className="font-bold text-emerald-800">
                00:{timer < 10 ? `0${timer}` : timer}
              </span>
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={isResending}
              className="font-bold text-[#0A3D2B] hover:underline flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>Resend OTP</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="pb-safe pt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleVerify()}
          disabled={!isFull || isVerifying}
          className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
            isFull && !isVerifying
              ? 'bg-[#0A3D2B] text-white shadow-emerald-950/20 hover:bg-[#0E4D36]'
              : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <span>Verify & Continue</span>
          )}
        </motion.button>
      </div>
    </div>
  );
};
