import { ChevronDown, ChevronUp, MapPin, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { formatTime } from '@/lib/time';

import type { RouteStop } from '../types';

interface StopListProps {
  stops: RouteStop[];
  onEdit: (stop: RouteStop) => void;
  onDelete: (stop: RouteStop) => void;
  onMove: (stop: RouteStop, sequence: number) => void;
  canUpdate: boolean;
  canDelete: boolean;
  isReordering?: boolean;
}

/**
 * The run, in order.
 *
 * Drawn as a timeline rather than a table because a route is a sequence — the
 * thing being checked is that the stops come in the right order at sensible
 * times, and a table of rows makes that the reader's job.
 */
export function StopList({
  stops,
  onEdit,
  onDelete,
  onMove,
  canUpdate,
  canDelete,
  isReordering = false,
}: StopListProps) {
  const ordered = [...stops].sort((left, right) => left.sequence - right.sequence);

  if (ordered.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="size-6" />}
        title="No stops yet"
        description="A route with no stops cannot carry anybody. Add the first pickup point."
      />
    );
  }

  return (
    <ol className="relative space-y-0">
      {ordered.map((stop, index) => {
        const isFirst = index === 0;
        const isLast = index === ordered.length - 1;

        return (
          <li key={stop.id} className="relative flex gap-4 px-4 py-3">
            {/* The line down the side of the run. */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'z-10 flex size-7 shrink-0 items-center justify-center rounded-full',
                  'text-xs font-semibold ring-2 ring-white',
                  isFirst
                    ? 'bg-emerald-100 text-emerald-700'
                    : isLast
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-slate-100 text-slate-600',
                )}
              >
                {stop.sequence}
              </span>
              {!isLast && <span className="-my-1 w-px flex-1 bg-slate-200" aria-hidden />}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="truncate font-medium text-slate-900">{stop.name}</p>
                {isFirst && <Badge tone="success">First pickup</Badge>}
                {isLast && <Badge tone="info">Last stop</Badge>}
              </div>

              {stop.landmark && <p className="truncate text-xs text-slate-500">{stop.landmark}</p>}

              <p className="mt-0.5 text-xs text-slate-600">
                Pickup {formatTime(stop.pickup_time)} · Drop {formatTime(stop.drop_time)} ·{' '}
                {formatCurrency(stop.fare)}/month
                {stop.students_count > 0 && (
                  <>
                    {' · '}
                    <span className="font-medium text-slate-800">
                      {stop.students_count} student{stop.students_count === 1 ? '' : 's'}
                    </span>
                  </>
                )}
              </p>

              {stop.latitude === null && (
                <p className="mt-0.5 text-xs text-amber-700">
                  No coordinates — this stop will not appear on the live map.
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-start gap-1">
              {canUpdate && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    disabled={isFirst || isReordering}
                    aria-label={`Move ${stop.name} earlier`}
                    onClick={() => onMove(stop, stop.sequence - 1)}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    disabled={isLast || isReordering}
                    aria-label={`Move ${stop.name} later`}
                    onClick={() => onMove(stop, stop.sequence + 1)}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Edit ${stop.name}`}
                    onClick={() => onEdit(stop)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </>
              )}

              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  // A stop with students on it is somebody's morning, not a row.
                  disabled={stop.students_count > 0}
                  title={
                    stop.students_count > 0
                      ? `${stop.students_count} students board here`
                      : 'Remove this stop'
                  }
                  aria-label={`Remove ${stop.name}`}
                  onClick={() => onDelete(stop)}
                >
                  <Trash2 className="size-4 text-red-600" />
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
