"use client";

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface CancelPickupModalProps {
  isOpen: boolean;
  pickupCode: string;
  onClose: () => void;
  onConfirmCancel: (reason: string) => Promise<void>;
}

const CANCEL_REASONS = [
  'Changed my mind',
  'Not available at scheduled time',
  'Found alternative scrap dealer',
  'Expected higher rate for scrap',
  'Accidentally placed request',
  'Other',
];

export const CancelPickupModal: React.FC<CancelPickupModalProps> = ({
  isOpen,
  pickupCode,
  onClose,
  onConfirmCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const finalReason =
        selectedReason === 'Other' && otherReasonText.trim()
          ? `Other: ${otherReasonText.trim()}`
          : selectedReason;
      await onConfirmCancel(finalReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Cancel Pickup Request</h3>
              <p className="text-[10px] text-slate-400">Request ID: {pickupCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reasons list */}
        <div className="my-3 overflow-y-auto space-y-2 flex-1 pr-1">
          <p className="text-xs text-slate-500 mb-2">
            Are you sure you want to cancel? Please tell us the reason:
          </p>

          {CANCEL_REASONS.map((r) => {
            const isSelected = selectedReason === r;
            return (
              <label
                key={r}
                onClick={() => setSelectedReason(r)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-rose-400 bg-rose-50/50 text-rose-950 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white font-medium'
                }`}
              >
                <span className="text-xs">{r}</span>
                <input
                  type="radio"
                  name="cancel_reason"
                  checked={isSelected}
                  onChange={() => setSelectedReason(r)}
                  className="accent-rose-600 w-4 h-4 cursor-pointer"
                />
              </label>
            );
          })}

          {selectedReason === 'Other' && (
            <textarea
              value={otherReasonText}
              onChange={(e) => setOtherReasonText(e.target.value)}
              placeholder="Please provide additional details..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-hidden focus:border-rose-500 mt-2 text-slate-800"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Keep Pickup
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isSubmitting ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
