import { Plus } from 'lucide-react';

import { cn } from '@/lib/cn';

import type { TimetableScope, TimetableSlot } from '../types';

interface SlotCellProps {
  slot: TimetableSlot | null;
  scope: TimetableScope;
  /** Free cells read as an invitation when the grid can be edited. */
  isEditable?: boolean;
}

/**
 * What one cell says.
 *
 * The three views carry the same three facts — who is taught, by whom, where —
 * and differ only in which is the headline. A section already knows its own
 * name, so its cells lead with the subject; a teacher's week leads with the
 * class, because that is the thing that changes hour to hour.
 */
export function SlotCell({ slot, scope, isEditable = false }: SlotCellProps) {
  if (!slot) {
    return (
      <span
        className={cn(
          'flex min-h-9 items-center gap-1 text-xs',
          isEditable ? 'text-slate-400' : 'text-slate-300',
        )}
      >
        {isEditable && <Plus className="size-3.5" aria-hidden />}
        Free
      </span>
    );
  }

  const sectionLabel = `${slot.class_name} — ${slot.section_name}`;

  const [headline, ...rest] =
    scope === 'section'
      ? [slot.subject_name, slot.teacher_name, slot.room_name]
      : scope === 'teacher'
        ? [sectionLabel, slot.subject_name, slot.room_name]
        : [sectionLabel, slot.subject_name, slot.teacher_name];

  return (
    <span className="block min-h-9">
      <span className="block truncate text-xs font-semibold text-slate-900">{headline}</span>

      {rest
        .filter((line): line is string => Boolean(line))
        .map((line) => (
          <span key={line} className="block truncate text-[11px] text-slate-500">
            {line}
          </span>
        ))}
    </span>
  );
}
