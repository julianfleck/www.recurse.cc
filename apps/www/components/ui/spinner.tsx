'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export function Spinner({
  className,
  size = 20,
  strokeWidth = 2.5,
}: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin', className)}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}
