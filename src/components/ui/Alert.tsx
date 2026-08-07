import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { ToneName } from '@/types/common';

const TONES: Record<ToneName, { wrapper: string; icon: string; Icon: ComponentType<{ className?: string }> }> = {
  neutral: { wrapper: 'bg-slate-50 border-slate-200 text-slate-700', icon: 'text-slate-500', Icon: Info },
  info: { wrapper: 'bg-brand-50 border-brand-200 text-brand-900', icon: 'text-brand-600', Icon: Info },
  success: {
    wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: 'text-amber-600',
    Icon: AlertTriangle,
  },
  danger: { wrapper: 'bg-red-50 border-red-200 text-red-900', icon: 'text-red-600', Icon: XCircle },
};

interface AlertProps {
  tone?: ToneName;
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Inline, non-dismissable message. For transient feedback use a toast. */
export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const { wrapper, icon, Icon } = TONES[tone];

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border px-4 py-3 text-sm', wrapper, className)}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', icon)} aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-0.5')}>{children}</div>
      </div>
    </div>
  );
}
