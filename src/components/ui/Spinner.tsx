import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { Size } from '@/types/common';

const SIZES: Record<Size, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-8',
};

interface SpinnerProps {
  size?: Size;
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn('animate-spin text-current', SIZES[size], className)}
    />
  );
}
