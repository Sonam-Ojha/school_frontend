import { Bus } from 'lucide-react';

import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/time';

import type { RouteStop, VehiclePosition } from '../types';

interface RouteProgressProps {
  stops: RouteStop[];
  position: VehiclePosition;
  className?: string;
}

/**
 * Where the bus is along its run.
 *
 * A schematic, not a map. Tiles would mean an external host, an API key and a
 * network call this app deliberately does not make — and for the question
 * actually being asked at 7:40am ("has it passed my child's stop yet?") a
 * strip of stops with the bus on it answers better than a map does. The raw
 * coordinates are printed alongside for anyone who needs them, and the
 * position contract carries them so a real map can be dropped in later
 * without touching anything else.
 */
export function RouteProgress({ stops, position, className }: RouteProgressProps) {
  const ordered = [...stops].sort((left, right) => left.sequence - right.sequence);
  if (ordered.length === 0) return null;

  const progress = Math.min(100, Math.max(0, position.progress_percent));

  return (
    <div className={cn('pt-8', className)}>
      <div className="relative">
        {/* The run, and how much of it is behind the bus. */}
        <div className="h-1 rounded-full bg-slate-200">
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-700',
              position.is_stale ? 'bg-slate-400' : 'bg-brand-500',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <span
          className={cn(
            'absolute -top-7 flex size-7 -translate-x-1/2 items-center justify-center',
            'rounded-full shadow-sm ring-2 ring-white transition-[left] duration-700',
            position.is_stale ? 'bg-slate-400 text-white' : 'bg-brand-600 text-white',
          )}
          style={{ left: `${progress}%` }}
          title={`${position.registration_no}${position.is_stale ? ' — last fix is stale' : ''}`}
        >
          <Bus className="size-4" aria-hidden />
        </span>

        {/* Stop markers, evenly spaced along the strip. */}
        <div className="absolute inset-x-0 top-0 flex justify-between">
          {ordered.map((stop, index) => {
            const passed = position.last_stop_id !== null && stop.sequence <= (ordered.find((entry) => entry.id === position.last_stop_id)?.sequence ?? 0);
            const isNext = stop.id === position.next_stop_id;

            return (
              <span
                key={stop.id}
                className="flex flex-col items-center"
                style={{
                  // Anchored to its share of the line, matching the progress scale.
                  position: 'absolute',
                  left: `${(index / Math.max(1, ordered.length - 1)) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <span
                  className={cn(
                    'size-2.5 rounded-full ring-2 ring-white',
                    isNext
                      ? 'bg-amber-500'
                      : passed
                        ? 'bg-brand-500'
                        : 'bg-slate-300',
                  )}
                />
              </span>
            );
          })}
        </div>
      </div>

      {/* Only the ends and the next stop are labelled — six labels on a phone
          would overlap into noise. */}
      <div className="mt-4 flex items-start justify-between gap-2 text-xs">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-700">{ordered[0].name}</p>
          <p className="text-slate-400">{formatTime(ordered[0].pickup_time)}</p>
        </div>

        {position.next_stop_name && (
          <div className="min-w-0 text-center">
            <p className="truncate font-medium text-amber-700">Next: {position.next_stop_name}</p>
            {position.eta_minutes !== null && (
              <p className="text-slate-500">
                {position.eta_minutes === 0 ? 'arriving' : `about ${position.eta_minutes} min`}
              </p>
            )}
          </div>
        )}

        <div className="min-w-0 text-right">
          <p className="truncate font-medium text-slate-700">{ordered.at(-1)!.name}</p>
          <p className="text-slate-400">{formatTime(ordered.at(-1)!.pickup_time)}</p>
        </div>
      </div>
    </div>
  );
}
