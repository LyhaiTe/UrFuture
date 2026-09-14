'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  variant?: 'navbar' | 'full' | 'icon-only';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function UrFutureLogo({ variant = 'navbar', className = '', size = 'md' }: LogoProps) {
  if (variant === 'navbar') {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        {/* Official UF Logo Mark */}
        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm shadow-[#00d2ff]/25 flex items-center justify-center p-0.5 shrink-0">
          <Image
            src="/logo.png"
            alt="UrFuture"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
        </div>
        <span className="font-extrabold text-lg text-white tracking-tight">
          Ur<span className="text-[#00d2ff]">Future</span>
        </span>
      </div>
    );
  }

  if (variant === 'icon-only') {
    const sizeClasses = {
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-12 h-12',
    }[size];

    return (
      <div className={`${sizeClasses} relative rounded-xl overflow-hidden bg-white shadow-lg shadow-[#00d2ff]/20 flex items-center justify-center p-1 ${className}`}>
        <Image
          src="/logo.png"
          alt="UrFuture"
          width={48}
          height={48}
          className="object-contain"
          priority
        />
      </div>
    );
  }

  // Full brand presentation
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative w-40 h-40 rounded-3xl overflow-hidden bg-white shadow-2xl shadow-[#00d2ff]/20 p-2 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="UrFuture — Learn • Plan • Achieve"
          width={160}
          height={160}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
