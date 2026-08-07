import { CalendarOff, CheckCheck, Lock, Save, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

import { HOLIDAY_TYPE_LABELS, STATUS_LABELS } from '../constants';
import type { AttendanceMarkInput } from '../schemas';
import type { AttendanceSheet as Sheet, AttendanceStatus } from '../types';

import { AttendanceSummaryBar } from './AttendanceSummaryBar';
import { SourceBadge } from './SourceBadge';
import { StatusPicker } from './StatusPicker';

interface AttendanceSheetProps {
  sheet: Sheet | undefined;
  isLoading: boolean;
  error: Error | null;
  isSaving: boolean;
  canMark: boolean;
  onSave: (entries: AttendanceMarkInput[]) => void;
  emptyMessage?: string;
}

/**
 * The daily marking sheet, shared by students, teachers and staff.
 *
 * Edits are held locally and submitted as a batch — marking a class of fifty
 * one request at a time would be slow and would half-save on a dropped
 * connection. Only changed rows are sent.
 */
export function AttendanceSheet({
  sheet,
  isLoading,
  error,
  isSaving,
  canMark,
  onSave,
  emptyMessage = 'Nobody to mark for this selection.',
}: AttendanceSheetProps) {
  /** person_id → pending status. Empty means nothing has been touched. */
  const [drafts, setDrafts] = useState<Record<number, AttendanceStatus>>({});
  const [search, setSearch] = useState('');

  const entries = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = sheet?.entries ?? [];
    if (!term) return all;

    return all.filter((entry) =>
      [entry.person_name, entry.identifier].join(' ').toLowerCase().includes(term),
    );
  }, [sheet?.entries, search]);

  const isLocked = sheet?.is_locked ?? false;
  const isEditable = canMark && !isLocked;

  const statusFor = (personId: number, saved: AttendanceStatus | null) =>
    drafts[personId] ?? saved;

  /** Live summary: the saved tally adjusted by whatever is still unsaved. */
  const summary = useMemo(() => {
    if (!sheet) return null;

    const counts = { present: 0, absent: 0, late: 0, half_day: 0, leave: 0, unmarked: 0 };

    for (const entry of sheet.entries) {
      const status = statusFor(entry.person_id, entry.status);
      if (status) counts[status] += 1;
      else counts.unmarked += 1;
    }

    return { ...counts, total: sheet.entries.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet, drafts]);

  const setStatus = (personId: number, status: AttendanceStatus) => {
    setDrafts((current) => ({ ...current, [personId]: status }));
  };

  /** Fills only the rows nobody has marked — never overwrites a decision. */
  const markRemainingPresent = () => {
    if (!sheet) return;

    const next: Record<number, AttendanceStatus> = { ...drafts };
    for (const entry of sheet.entries) {
      if (entry.leave) continue; // an approved leave is not overridable
      if (statusFor(entry.person_id, entry.status) === null) next[entry.person_id] = 'present';
    }
    setDrafts(next);
  };

  const changed = Object.entries(drafts).filter(([personId, status]) => {
    const entry = sheet?.entries.find((candidate) => candidate.person_id === Number(personId));
    return entry && entry.status !== status;
  });

  const handleSave = () => {
    onSave(
      changed.map(([personId, status]) => ({
        person_id: Number(personId),
        status,
        remarks: '',
      })),
    );
    setDrafts({});
  };

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load the sheet">
            {error.message}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-8 w-40" />
            </div>
          ))}
        </CardBody>
      </Card>
    );
  }

  if (!sheet) return null;

  return (
    <Card>
      {/* A locked sheet always says why — a disabled screen with no reason is
          the fastest way to generate a support ticket. */}
      {isLocked && (
        <div className="border-b border-slate-200 bg-amber-50/70 px-4 py-3 sm:px-6">
          <p className="flex items-start gap-2 text-sm text-amber-900">
            {sheet.holiday ? (
              <CalendarOff className="mt-0.5 size-4 shrink-0" aria-hidden />
            ) : (
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            <span>
              {sheet.holiday ? (
                <>
                  <strong>{sheet.holiday.name}</strong> —{' '}
                  {HOLIDAY_TYPE_LABELS[sheet.holiday.type].toLowerCase()} on{' '}
                  {formatDate(sheet.date)}. Attendance is not taken.
                </>
              ) : (
                (sheet.lock_reason ?? 'This sheet is read-only.')
              )}
            </span>
          </p>
        </div>
      )}

      {summary && <AttendanceSummaryBar summary={summary} />}

      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Find a person…"
          aria-label="Find a person"
          leftIcon={<Search className="size-4" />}
          className="sm:max-w-xs"
        />

        {isEditable && summary && summary.unmarked > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markRemainingPresent}
            leftIcon={<CheckCheck className="size-4" />}
          >
            Mark remaining {summary.unmarked} present
          </Button>
        )}
      </div>

      <CardBody className="p-0">
        {entries.length === 0 ? (
          <EmptyState
            icon={<Users className="size-6" />}
            title={search ? 'Nobody matches that search' : 'Nothing to mark'}
            description={search ? 'Try a different name or ID.' : emptyMessage}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {entries.map((entry) => {
              const status = statusFor(entry.person_id, entry.status);
              const isDirty = drafts[entry.person_id] !== undefined && entry.status !== status;
              // Attendance must not contradict an approved leave.
              const rowLocked = !isEditable || Boolean(entry.leave);

              return (
                <li
                  key={entry.person_id}
                  className={cn(
                    'flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6',
                    isDirty && 'bg-brand-50/40',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={entry.person_name} src={entry.photo_url} size="sm" />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {entry.person_name}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                        <code>{entry.identifier}</code>
                        {entry.group_label && <span>{entry.group_label}</span>}
                        {entry.check_in_at && (
                          <span>
                            in{' '}
                            {new Date(entry.check_in_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                        <SourceBadge source={entry.source} />
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {entry.leave ? (
                      <Badge tone="warning" withDot>
                        On leave — {entry.leave.type}
                      </Badge>
                    ) : (
                      <>
                        {isDirty && <span className="text-xs text-brand-600">unsaved</span>}
                        <StatusPicker
                          value={status}
                          onChange={(next) => setStatus(entry.person_id, next)}
                          disabled={rowLocked}
                          personName={entry.person_name}
                        />
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>

      {isEditable && (
        <CardFooter className="justify-between">
          <span className="text-xs text-slate-500">
            {changed.length === 0
              ? 'No changes to save'
              : `${changed.length} change${changed.length === 1 ? '' : 's'} pending`}
          </span>

          <div className="flex items-center gap-2">
            {changed.length > 0 && (
              <Button variant="ghost" onClick={() => setDrafts({})} disabled={isSaving}>
                Discard
              </Button>
            )}
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              disabled={changed.length === 0}
              leftIcon={<Save className="size-4" />}
            >
              Save attendance
            </Button>
          </div>
        </CardFooter>
      )}

      {!canMark && !isLocked && (
        <CardFooter>
          <span className="text-xs text-slate-500">
            You have read-only access to attendance. Statuses shown are{' '}
            {Object.values(STATUS_LABELS).join(', ').toLowerCase()}.
          </span>
        </CardFooter>
      )}
    </Card>
  );
}
