import { Lock, Save, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

import {
  ACCOUNTED_FOR,
  ROLL_CALL_CELL_CLASSES,
  ROLL_CALL_STATUS_INITIALS,
  ROLL_CALL_STATUS_LABELS,
  ROLL_CALL_STATUS_OPTIONS,
} from '../constants';
import type { RollCall, RollCallStatus } from '../types';
import type { RollCallEntryInput } from '../schemas';

interface RollCallSheetProps {
  rollCall: RollCall;
  onSave: (entries: RollCallEntryInput[]) => void;
  isSaving: boolean;
  canMark: boolean;
}

interface Draft {
  status: RollCallStatus | null;
  remarks: string;
}

/**
 * The evening register.
 *
 * Marks are held locally and saved in one batch, like the attendance sheet
 * and the exam marks entry — calling eighty residents one request at a time
 * half-saves on a dropped connection, and a half-called register is worse
 * than none.
 *
 * "Mark the rest present" exists because on a normal night almost everybody
 * is: the warden's job is to record the handful who are not, and making them
 * click eighty times to say nothing happened is how registers get filled in
 * from memory the next morning.
 */
export function RollCallSheet({ rollCall, onSave, isSaving, canMark }: RollCallSheetProps) {
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});

  // Reset when the sheet underneath changes — a different hostel or night.
  useEffect(() => {
    setDrafts({});
  }, [rollCall.hostel_id, rollCall.date]);

  const valueFor = (allocationId: number): Draft => {
    const draft = drafts[allocationId];
    if (draft) return draft;

    const entry = rollCall.entries.find((row) => row.allocation_id === allocationId);
    return { status: entry?.status ?? null, remarks: entry?.remarks ?? '' };
  };

  const setDraft = (allocationId: number, patch: Partial<Draft>) => {
    setDrafts((current) => ({
      ...current,
      [allocationId]: { ...valueFor(allocationId), ...patch },
    }));
  };

  /** Only the rows that actually changed are sent. */
  const changed = useMemo(
    () =>
      Object.entries(drafts)
        .map(([id, draft]) => ({ allocationId: Number(id), draft }))
        .filter(({ allocationId, draft }) => {
          const entry = rollCall.entries.find((row) => row.allocation_id === allocationId);
          if (!entry) return false;
          return draft.status !== entry.status || draft.remarks !== (entry.remarks ?? '');
        })
        .filter(({ draft }) => draft.status !== null),
    [drafts, rollCall.entries],
  );

  /** Anything but present needs a word about it — the API insists too. */
  const missingRemarks = changed.filter(
    ({ draft }) => draft.status !== 'present' && draft.remarks.trim() === '',
  );

  const markRestPresent = () => {
    const patch: Record<number, Draft> = {};
    for (const entry of rollCall.entries) {
      const current = valueFor(entry.allocation_id);
      if (current.status === null) patch[entry.allocation_id] = { status: 'present', remarks: '' };
    }
    setDrafts((existing) => ({ ...existing, ...patch }));
  };

  const save = () => {
    onSave(
      changed.map(({ allocationId, draft }) => ({
        allocation_id: allocationId,
        status: draft.status!,
        remarks: draft.remarks,
      })),
    );
  };

  if (rollCall.entries.length === 0) {
    return (
      <EmptyState
        icon={<UserCheck className="size-6" />}
        title="Nobody resident"
        description="No student was allocated a bed in this block on this date."
      />
    );
  }

  // Counted from the drafts so the header moves as the warden works.
  const live = rollCall.entries.reduce(
    (totals, entry) => {
      const { status } = valueFor(entry.allocation_id);
      if (status === null) return { ...totals, unmarked: totals.unmarked + 1 };
      if (ACCOUNTED_FOR.includes(status)) return { ...totals, accounted: totals.accounted + 1 };
      return { ...totals, missing: totals.missing + 1 };
    },
    { accounted: 0, missing: 0, unmarked: 0 },
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            <span className="font-semibold text-emerald-700">{live.accounted}</span>{' '}
            <span className="text-slate-500">accounted for</span>
          </span>
          <span>
            <span
              className={cn('font-semibold', live.missing > 0 ? 'text-red-700' : 'text-slate-900')}
            >
              {live.missing}
            </span>{' '}
            <span className="text-slate-500">unaccounted</span>
          </span>
          <span>
            <span
              className={cn(
                'font-semibold',
                live.unmarked > 0 ? 'text-amber-700' : 'text-slate-900',
              )}
            >
              {live.unmarked}
            </span>{' '}
            <span className="text-slate-500">still to call</span>
          </span>
        </div>

        {canMark && !rollCall.is_locked && (
          <div className="ml-auto flex gap-2">
            {live.unmarked > 0 && (
              <Button variant="outline" size="sm" onClick={markRestPresent}>
                Mark the rest present
              </Button>
            )}
            <Button
              size="sm"
              isLoading={isSaving}
              disabled={changed.length === 0 || missingRemarks.length > 0}
              onClick={save}
              leftIcon={<Save className="size-4" />}
            >
              Save {changed.length > 0 ? `${changed.length} ` : ''}
              {changed.length === 1 ? 'change' : 'changes'}
            </Button>
          </div>
        )}
      </div>

      {rollCall.is_locked && (
        <Alert tone="info" className="m-4">
          <span className="flex items-center gap-2">
            <Lock className="size-4 shrink-0" aria-hidden />
            {rollCall.lock_reason ?? 'This register is closed.'}
          </span>
        </Alert>
      )}

      {missingRemarks.length > 0 && (
        <Alert tone="warning" className="m-4" title="Say why">
          {missingRemarks.length} resident{missingRemarks.length === 1 ? '' : 's'} marked as
          something other than present without a note. A register that says "absent" and nothing
          else is the entry somebody is asked about a week later.
        </Alert>
      )}

      <ul className="divide-y divide-slate-100">
        {rollCall.entries.map((entry) => {
          const draft = valueFor(entry.allocation_id);
          const needsRemarks = draft.status !== null && draft.status !== 'present';

          return (
            <li key={entry.allocation_id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <Avatar name={entry.student_name} src={entry.photo_url} size="sm" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {entry.student_name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    <code>{entry.admission_no}</code> · {entry.class_name} · Room{' '}
                    {entry.room_no}, bed {entry.bed_no}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-1">
                  {ROLL_CALL_STATUS_OPTIONS.map((option) => {
                    const status = option.value;
                    const isSelected = draft.status === status;

                    return (
                      <button
                        key={status}
                        type="button"
                        disabled={!canMark || rollCall.is_locked}
                        aria-pressed={isSelected}
                        title={ROLL_CALL_STATUS_LABELS[status]}
                        aria-label={`${entry.student_name}: ${ROLL_CALL_STATUS_LABELS[status]}`}
                        onClick={() =>
                          setDraft(entry.allocation_id, {
                            status: isSelected ? null : status,
                            // Clearing back to unmarked drops the note with it.
                            ...(isSelected ? { remarks: '' } : {}),
                          })
                        }
                        className={cn(
                          'flex size-8 items-center justify-center rounded-md text-xs font-semibold',
                          'transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                          isSelected
                            ? ROLL_CALL_CELL_CLASSES[status]
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100',
                        )}
                      >
                        {ROLL_CALL_STATUS_INITIALS[status]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {needsRemarks && (
                <div className="mt-2 pl-11">
                  <Input
                    value={draft.remarks}
                    onChange={(event) =>
                      setDraft(entry.allocation_id, { remarks: event.target.value })
                    }
                    disabled={!canMark || rollCall.is_locked}
                    placeholder={
                      draft.status === 'out_pass'
                        ? 'Where, and back when?'
                        : draft.status === 'on_leave'
                          ? 'Gone home until…'
                          : 'What happened?'
                    }
                    hasError={draft.remarks.trim() === ''}
                    className="max-w-lg"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
