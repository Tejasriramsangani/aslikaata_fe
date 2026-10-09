"use client";

import React from 'react';
import { Check } from 'lucide-react';

export type PickupLifecycleStatus =
  | 'REQUESTED'
  | 'SCHEDULED'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'VERIFIED'
  | 'IN_PROGRESS'
  | 'MEASURED'
  | 'SUMMARY_READY'
  | 'CUSTOMER_CONFIRMED'
  | 'SETTLED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

interface LifecycleStepperProps {
  status: PickupLifecycleStatus | string;
}

interface StepNode {
  step: number;
  label: string;
}

const STEPS: StepNode[] = [
  { step: 1, label: 'Placed' },
  { step: 2, label: 'Scheduled' },
  { step: 3, label: 'Employee Assigned' },
];

export const LifecycleStepper: React.FC<LifecycleStepperProps> = ({ status }) => {
  // Determine normalized stage: 1 = Placed, 2 = Scheduled, 3 = Assigned+
  let activeStep = 1;
  if (status === 'SCHEDULED') {
    activeStep = 2;
  } else if (
    status === 'ASSIGNED' ||
    status === 'ON_THE_WAY' ||
    status === 'ARRIVED' ||
    status === 'VERIFIED' ||
    status === 'IN_PROGRESS' ||
    status === 'MEASURED' ||
    status === 'SUMMARY_READY' ||
    status === 'CUSTOMER_CONFIRMED' ||
    status === 'SETTLED' ||
    status === 'COMPLETED'
  ) {
    activeStep = 3;
  }

  return (
    <div className="w-full bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 mb-4">
      <div className="relative flex items-center justify-between px-3">
        {/* Connecting Lines Behind Circles */}
        <div className="absolute top-4 left-7 right-7 h-[2px] bg-slate-200 z-0">
          <div
            className="h-full bg-[#0A3D2B] transition-all duration-500 ease-in-out"
            style={{
              width:
                activeStep === 1
                  ? '0%'
                  : activeStep === 2
                  ? '50%'
                  : '100%',
            }}
          />
        </div>

        {/* 3 Step Nodes */}
        {STEPS.map((s) => {
          const isDone = activeStep > s.step;
          const isCurrent = activeStep === s.step;

          return (
            <div
              key={s.step}
              className="relative z-10 flex flex-col items-center flex-1"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-xs ${
                  isDone
                    ? 'bg-[#0A3D2B] text-white border-2 border-[#0A3D2B]'
                    : isCurrent
                    ? 'bg-[#0A3D2B] text-white border-2 border-[#0A3D2B] ring-4 ring-emerald-100'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{s.step}</span>
                )}
              </div>

              <span
                className={`mt-2 text-center text-[11px] leading-tight font-semibold tracking-tight transition-colors ${
                  isCurrent || isDone ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
