import { cn } from '@/lib/cn';

interface UsageMeterProps {
  label: string;
  used: number;
  /** Null is unlimited. */
  limit: number | null;
  /** Formats both figures, e.g. as bytes. */
  format?: (value: number) => string;
  hint?: string;
}

/** One plan limit: how much is used, how much the plan allows, and a bar that turns amber then red. */
export function UsageMeter({ label, used, limit, format = (value) => value.toLocaleString('en-IN'), hint }: UsageMeterProps) {
  const share = limit && limit > 0 ? Math.min(1, used / limit) : 0;
  const percent = Math.round(share * 100);
  const tone = share >= 0.9 ? 'bg-red-500' : share >= 0.75 ? 'bg-amber-500' : 'bg-brand-600';

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500 tabular-nums">
          <span className="font-semibold text-slate-900">{format(used)}</span>
          {limit === null ? ' · unlimited' : ` of ${format(limit)}`}
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit ?? used}
        aria-valuenow={used}
      >
        {limit === null ? (
          <div className="h-full w-full rounded-full bg-emerald-100" />
        ) : (
          <div
            className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tone)}
            style={{ width: `${Math.max(percent, used > 0 ? 2 : 0)}%` }}
          />
        )}
      </div>
      {(hint || (limit !== null && share >= 0.9)) && (
        <p className={cn('mt-1.5 text-xs', share >= 0.9 ? 'text-red-600' : 'text-slate-500')}>
          {limit !== null && share >= 1
            ? 'Limit reached — upgrade to add more.'
            : limit !== null && share >= 0.9
              ? `${percent}% used — nearly at the limit.`
              : hint}
        </p>
      )}
    </div>
  );
}
