import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

import { NEARLY_FULL_RATIO } from '../constants';

interface CapacityBarProps {
  enrolled: number;
  capacity: number;
  /** Hide the numeric label when the surrounding cell already shows it. */
  showLabel?: boolean;
  className?: string;
}

/**
 * Occupancy against capacity.
 *
 * Amber past 90% so a section can be split before it fills, and red once
 * enrolment exceeds capacity — which is a real state, not an impossible one:
 * seats get cut, or students get admitted over the line.
 */
export function CapacityBar({
  enrolled,
  capacity,
  showLabel = true,
  className,
}: CapacityBarProps) {
  const ratio = capacity > 0 ? enrolled / capacity : 0;
  const isOver = enrolled > capacity;
  const isNearlyFull = !isOver && ratio >= NEARLY_FULL_RATIO;

  const tone = isOver ? 'bg-red-500' : isNearlyFull ? 'bg-amber-500' : 'bg-emerald-500';
  const textTone = isOver ? 'text-red-700' : isNearlyFull ? 'text-amber-700' : 'text-slate-600';

  return (
    <div className={cn('min-w-24', className)}>
      {showLabel && (
        <div className={cn('mb-1 flex items-baseline justify-between gap-2 text-xs', textTone)}>
          <span className="font-medium">
            {formatNumber(enrolled)} / {formatNumber(capacity)}
          </span>
          {isOver ? (
            <span className="font-semibold">over by {formatNumber(enrolled - capacity)}</span>
          ) : (
            <span>{formatNumber(capacity - enrolled)} free</span>
          )}
        </div>
      )}

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="meter"
        aria-valuenow={enrolled}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-label={`${enrolled} of ${capacity} seats filled`}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-300', tone)}
          // Clamped so an over-capacity bar stays inside its track.
          style={{ width: `${Math.min(100, ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}
