import { Fingerprint, Hand, QrCode, Upload, CalendarOff } from 'lucide-react';
import type { ComponentType } from 'react';

import { cn } from '@/lib/cn';

import { SOURCE_LABELS, SOURCE_SHORT_LABELS } from '../constants';
import type { AttendanceSource } from '../types';

const ICONS: Record<AttendanceSource, ComponentType<{ className?: string }>> = {
  manual: Hand,
  qr: QrCode,
  biometric: Fingerprint,
  import: Upload,
  leave: CalendarOff,
};

const TONES: Record<AttendanceSource, string> = {
  manual: 'text-slate-400',
  qr: 'text-brand-600',
  biometric: 'text-emerald-600',
  import: 'text-slate-500',
  leave: 'text-amber-600',
};

/**
 * How a mark was captured.
 *
 * Deliberately quiet — an icon with a tooltip, not a badge. On a sheet of
 * fifty rows the status is what matters; the source only matters when someone
 * asks why a row says what it says.
 */
export function SourceBadge({
  source,
  withLabel = false,
}: {
  source: AttendanceSource | null;
  withLabel?: boolean;
}) {
  if (!source) return null;

  const Icon = ICONS[source];

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-xs', TONES[source])}
      title={SOURCE_LABELS[source]}
    >
      <Icon className="size-3.5" aria-hidden />
      {withLabel ? SOURCE_SHORT_LABELS[source] : <span className="sr-only">{SOURCE_LABELS[source]}</span>}
    </span>
  );
}
