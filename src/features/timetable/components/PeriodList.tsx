import { Coffee, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Shift } from '@/features/academics/types';
import { cn } from '@/lib/cn';
import { formatTimeRange, toMinutes } from '@/lib/time';

import { SHIFT_LABELS } from '../constants';
import type { Period } from '../types';

interface PeriodListProps {
  shift: Shift;
  periods: Period[];
  onEdit: (period: Period) => void;
  onDelete: (period: Period) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * Is there dead time or an overlap between two consecutive periods?
 *
 * Worth surfacing rather than validating away: a fifteen-minute gap is a
 * legitimate changeover, an overlap never is, and the only way to see either
 * is to look at the day as a whole.
 */
function gapAfter(period: Period, next: Period | undefined): number | null {
  if (!next) return null;

  const end = toMinutes(period.end_time);
  const start = toMinutes(next.start_time);
  if (end === null || start === null) return null;

  return start - end;
}

export function PeriodList({
  shift,
  periods,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: PeriodListProps) {
  const ordered = [...periods].sort((left, right) => left.sort_order - right.sort_order);

  const teaching = ordered.filter((period) => !period.is_break).length;

  return (
    <Card>
      <CardHeader
        title={`${SHIFT_LABELS[shift]} shift`}
        description={
          ordered.length === 0
            ? 'No periods yet.'
            : `${ordered.length} periods · ${teaching} teaching`
        }
      />

      <CardBody className={ordered.length === 0 ? undefined : 'p-0'}>
        {ordered.length === 0 ? (
          <EmptyState
            icon={<Coffee className="size-6" />}
            title="No periods on this shift"
            description="Add the first period to start building the day."
          />
        ) : (
          <ol className="divide-y divide-slate-100">
            {ordered.map((period, index) => {
              const gap = gapAfter(period, ordered[index + 1]);

              return (
                <li key={period.id}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3',
                      period.is_break && 'bg-amber-50/60',
                    )}
                  >
                    <span className="w-7 shrink-0 text-center text-xs font-semibold text-slate-400">
                      {period.sort_order}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-medium text-slate-900">
                        {period.name}
                        {period.is_break && <Badge tone="warning">Break</Badge>}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatTimeRange(period.start_time, period.end_time)} ·{' '}
                        {period.duration_minutes} min
                        {period.slots_count > 0 && ` · ${period.slots_count} lessons`}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconOnly
                          aria-label={`Edit ${period.name}`}
                          onClick={() => onEdit(period)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconOnly
                          aria-label={`Delete ${period.name}`}
                          onClick={() => onDelete(period)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {gap !== null && gap !== 0 && (
                    <p
                      className={cn(
                        'px-4 pb-2 text-xs',
                        gap < 0 ? 'font-medium text-red-600' : 'text-slate-400',
                      )}
                    >
                      {gap < 0
                        ? `Overlaps the next period by ${Math.abs(gap)} minutes`
                        : `${gap} minute gap`}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
