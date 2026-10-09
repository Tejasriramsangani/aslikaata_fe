"use client";

import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto'; // 'light' is for dark backdrops (e.g. wrapped in a soft white capsule), 'dark' is for light backdrops
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'auto',
}) => {
  const sizeMap = {
    sm: { width: 120, height: 40, hClass: 'h-7' },
    md: { width: 150, height: 50, hClass: 'h-9' },
    lg: { width: 190, height: 63, hClass: 'h-12' },
    xl: { width: 240, height: 80, hClass: 'h-16' },
  };

  const { width, height, hClass } = sizeMap[size];

  // If on a dark green background (variant === 'light'), wrap in a clean crisp white capsule
  if (variant === 'light') {
    return (
      <div className={`inline-flex items-center justify-center bg-white rounded-2xl px-3 py-1.5 shadow-md ${className}`}>
        <Image
          src="/logo.png"
          alt="ASLI KAATA - Real Weight. Real Value."
          width={width}
          height={height}
          priority
          className={`${hClass} w-auto object-contain`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Image
        src="/logo.png"
        alt="ASLI KAATA - Real Weight. Real Value."
        width={width}
        height={height}
        priority
        className={`${hClass} w-auto object-contain`}
      />
    </div>
  );
};
