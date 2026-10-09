"use client";

import React from 'react';
import { Phone, ShieldCheck, Truck } from 'lucide-react';

export interface EmployeeInfo {
  employeeName: string;
  employeeCode?: string;
  employeePhone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
}

interface EmployeeContactCardProps {
  employee?: EmployeeInfo | null;
}

export const EmployeeContactCard: React.FC<EmployeeContactCardProps> = ({ employee }) => {
  if (!employee) return null;

  const phone = employee.employeePhone || '9876543210';
  const name = employee.employeeName || 'Ramesh Kumar';
  const code = employee.employeeCode || 'AKP-EMP-0247';

  return (
    <div className="w-full bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 mb-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar & Details */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-13 h-13 rounded-full bg-linear-to-br from-emerald-100 to-teal-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-800 font-black text-base shadow-xs">
              <span className="text-xl">🧢</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 border-2 border-white shadow-xs">
              <ShieldCheck className="w-2.5 h-2.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                {name}
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Employee ID: <span className="font-semibold text-slate-700">{code}</span>
            </p>
            {employee.vehicleNumber && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                <Truck className="w-3 h-3 text-emerald-700" />
                <span>{employee.vehicleType || 'Auto'} • {employee.vehicleNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Direct Phone Dial Button */}
        <a
          href={`tel:${phone}`}
          className="w-11 h-11 rounded-full bg-[#0A3D2B] hover:bg-[#06291C] active:scale-95 text-white flex items-center justify-center shadow-sm transition-all cursor-pointer group"
          title={`Call ${name}`}
          aria-label={`Call ${name}`}
        >
          <Phone className="w-5 h-5 fill-white stroke-none group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </div>
  );
};
