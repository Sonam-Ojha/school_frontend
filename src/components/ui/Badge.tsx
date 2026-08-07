import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { ToneName } from '@/types/common';

const TONES: Record<ToneName, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-brand-50 text-brand-700 ring-brand-200',
};

interface BadgeProps {
  tone?: ToneName;
  children: ReactNode;
  className?: string;
  /** Leading status dot — useful in table status columns. */
  withDot?: boolean;
}

export function Badge({ tone = 'neutral', children, className, withDot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-medium ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {withDot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
