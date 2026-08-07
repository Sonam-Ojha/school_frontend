import { cn } from '@/lib/cn';

import { STATUS_INITIALS, STATUS_LABELS, STATUS_OPTIONS } from '../constants';
import type { AttendanceStatus } from '../types';

const ACTIVE_CLASSES: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-600 text-white border-emerald-600',
  absent: 'bg-red-600 text-white border-red-600',
  late: 'bg-amber-500 text-white border-amber-500',
  half_day: 'bg-brand-600 text-white border-brand-600',
  leave: 'bg-slate-600 text-white border-slate-600',
};

interface StatusPickerProps {
  value: AttendanceStatus | null;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
  /** Row label for screen readers — the buttons are single letters. */
  personName: string;
}

/**
 * The per-row status control.
 *
 * A segmented row of buttons rather than a dropdown: marking a class of fifty
 * is the module's most repeated action, and one tap beats open-select-pick.
 * Letters keep the control narrow enough to sit in a table row on mobile.
 */
export function StatusPicker({ value, onChange, disabled = false, personName }: StatusPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label={`Attendance for ${personName}`}
      className="inline-flex overflow-hidden rounded-lg border border-slate-300"
    >
      {STATUS_OPTIONS.map((option, index) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            title={STATUS_LABELS[option.value]}
            onClick={() => onChange(option.value)}
            className={cn(
              'size-8 text-xs font-semibold transition-colors duration-100',
              index > 0 && 'border-l border-slate-300',
              isActive
                ? ACTIVE_CLASSES[option.value]
                : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            {STATUS_INITIALS[option.value]}
            <span className="sr-only">{STATUS_LABELS[option.value]}</span>
          </button>
        );
      })}
    </div>
  );
}
