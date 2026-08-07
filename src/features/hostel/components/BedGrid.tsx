import { BedDouble, Pencil, Trash2, UserMinus } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

import { BED_STATUS_LABELS, BED_STATUS_TONES } from '../constants';
import type { Bed } from '../types';

interface BedGridProps {
  beds: Bed[];
  onEdit: (bed: Bed) => void;
  onDelete: (bed: Bed) => void;
  onVacate: (bed: Bed) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * The beds in a room, drawn as beds.
 *
 * A card per bed rather than a table row: the question being asked is "which
 * one is free", and a grid answers it at a glance where a list makes the
 * reader scan a status column. Each card carries its occupant, because the
 * second question is always "who is in the other one".
 */
export function BedGrid({
  beds,
  onEdit,
  onDelete,
  onVacate,
  canUpdate,
  canDelete,
}: BedGridProps) {
  const ordered = [...beds].sort((left, right) => left.bed_no.localeCompare(right.bed_no));

  if (ordered.length === 0) {
    return (
      <EmptyState
        icon={<BedDouble className="size-6" />}
        title="No beds yet"
        description="A room with no beds cannot take anybody. Add the beds that are in it."
      />
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {ordered.map((bed) => (
        <li
          key={bed.id}
          className={cn(
            'rounded-lg border p-3',
            bed.status === 'occupied'
              ? 'border-slate-200 bg-white'
              : bed.status === 'vacant'
                ? 'border-dashed border-emerald-300 bg-emerald-50/40'
                : 'border-dashed border-slate-300 bg-slate-50',
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">Bed {bed.bed_no}</p>
            <Badge tone={BED_STATUS_TONES[bed.status]} withDot>
              {BED_STATUS_LABELS[bed.status]}
            </Badge>
          </div>

          {bed.occupant ? (
            <div className="flex items-center gap-2">
              <Avatar
                name={bed.occupant.student_name}
                src={bed.occupant.photo_url}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-900">{bed.occupant.student_name}</p>
                <p className="truncate text-xs text-slate-500">
                  <code>{bed.occupant.admission_no}</code> · {bed.occupant.class_name}
                </p>
                <p className="truncate text-xs text-slate-400">
                  Since {formatDate(bed.occupant.allocated_on)}
                </p>
              </div>
            </div>
          ) : (
            <p className="py-2 text-xs text-slate-500">
              {bed.status === 'vacant' ? 'Free to allocate' : 'Not available'}
              {bed.notes ? ` · ${bed.notes}` : ''}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-1 border-t border-slate-100 pt-2">
            {bed.occupant && canUpdate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVacate(bed)}
                leftIcon={<UserMinus className="size-4" />}
              >
                Vacate
              </Button>
            )}

            {canUpdate && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                // A bed with somebody in it is somebody's home, not a row.
                disabled={bed.status === 'occupied'}
                title={
                  bed.status === 'occupied' ? 'Vacate it first' : `Edit bed ${bed.bed_no}`
                }
                aria-label={`Edit bed ${bed.bed_no}`}
                onClick={() => onEdit(bed)}
              >
                <Pencil className="size-4" />
              </Button>
            )}

            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                disabled={bed.status === 'occupied'}
                title={
                  bed.status === 'occupied' ? 'Vacate it first' : `Remove bed ${bed.bed_no}`
                }
                aria-label={`Remove bed ${bed.bed_no}`}
                onClick={() => onDelete(bed)}
              >
                <Trash2 className="size-4 text-red-600" />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
