'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';

interface RadialProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
}

export function RadialProgress({
  progress,
  size = 16,
  strokeWidth = 2,
  showValue = false,
  className,
  ...props
}: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg className="-rotate-90 transform" height={size} width={size}>
        {/* Background circle */}
        <circle
          className="opacity-20"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className="transition-all duration-300 ease-in-out"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      {showValue && (
        <span className="absolute font-medium text-[0.625rem]">
          {Math.round(progress)}
        </span>
      )}
    </div>
  );
}
