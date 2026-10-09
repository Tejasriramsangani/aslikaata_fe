"use client";

import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { usePickupBooking } from '../../context/PickupBookingContext';
import { CategoryStep } from './CategoryStep';
import { WeightRangeStep } from './WeightRangeStep';
import { ScheduleSlotStep } from './ScheduleSlotStep';
import { ReviewRequestStep } from './ReviewRequestStep';
import { BookingSuccessStep } from './BookingSuccessStep';

interface BookingWizardModalProps {
  onClose: () => void;
  onGoToPickups: (pickup?: any) => void;
  onGoToHome: () => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  onClose,
  onGoToPickups,
  onGoToHome,
}) => {
  const { state, setStep, setConfirmedPickup } = usePickupBooking();

  const handleBack = () => {
    if (state.step === 1) {
      onClose();
    } else if (state.step > 1 && state.step < 5) {
      setStep((state.step - 1) as 1 | 2 | 3 | 4);
    } else {
      onGoToHome();
    }
  };

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Top Header Bar (Image 3 Header) */}
      <div className="flex items-center justify-between py-2 mb-3 border-b border-slate-200/80">
        {state.step < 5 ? (
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        <div className="text-center">
          <h1 className="text-sm font-black text-slate-900 tracking-tight">
            {state.step === 5 ? 'Pickup Details' : 'Request Pickup'}
          </h1>
          {state.step < 5 && (
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    stepNum === state.step
                      ? 'w-6 bg-[#0A3D2B]'
                      : stepNum < state.step
                      ? 'w-3 bg-emerald-400'
                      : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={state.step === 5 ? onGoToHome : onClose}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Step Render Area */}
      <div className="flex-1">
        {state.step === 1 && (
          <CategoryStep
            onBack={onClose}
            onNext={() => setStep(2)}
          />
        )}

        {state.step === 2 && (
          <WeightRangeStep
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {state.step === 3 && (
          <ScheduleSlotStep
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {state.step === 4 && (
          <ReviewRequestStep
            onBack={() => setStep(3)}
            onEditStep={(targetStep) => setStep(targetStep as 1 | 2 | 3 | 4)}
            onSuccess={(bookingData) => {
              setConfirmedPickup(bookingData);
              setStep(5);
            }}
          />
        )}

        {state.step === 5 && (
          <BookingSuccessStep
            onGoToPickups={onGoToPickups}
            onGoToHome={onGoToHome}
          />
        )}
      </div>
    </div>
  );
};
