import { Save, Search, UserX } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { gradeFor, percentFor, toneForGrade } from '@/lib/grading';

import type { MarkInput } from '../schemas';
import type { ExamPaper, PaperMark, PaperMarksSummary } from '../types';

interface Draft {
  marks: number | null;
  absent: boolean;
}

interface MarksEntrySheetProps {
  paper: ExamPaper;
  rows: PaperMark[];
  summary: PaperMarksSummary;
  isLoading: boolean;
  error: Error | null;
  isSaving: boolean;
  canEnter: boolean;
  onSave: (marks: MarkInput[]) => void;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn('mt-0.5 text-lg font-semibold', tone ?? 'text-slate-900')}>{value}</p>
    </div>
  );
}

/**
 * Marks entry for one paper.
 *
 * Edits are held locally and submitted as a batch — entering a class of forty
 * one request at a time would be slow and would half-save on a dropped
 * connection. Only changed rows are sent.
 *
 * Absent and zero are kept distinct throughout: a zero means the student sat
 * the paper and scored nothing, which is a different claim entirely.
 */
export function MarksEntrySheet({
  paper,
  rows,
  summary,
  isLoading,
  error,
  isSaving,
  canEnter,
  onSave,
}: MarksEntrySheetProps) {
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) =>
      [row.student_name, row.admission_no, row.roll_no ?? ''].join(' ').toLowerCase().includes(term),
    );
  }, [rows, search]);

  const stateFor = (row: PaperMark): Draft =>
    drafts[row.student_id] ?? { marks: row.marks_obtained, absent: row.is_absent };

  const setDraft = (studentId: number, patch: Partial<Draft>) => {
    setDrafts((current) => {
      const row = rows.find((entry) => entry.student_id === studentId);
      const base = current[studentId] ?? {
        marks: row?.marks_obtained ?? null,
        absent: row?.is_absent ?? false,
      };
      return { ...current, [studentId]: { ...base, ...patch } };
    });
  };

  /** Live tally: the saved figures adjusted by whatever is still unsaved. */
  const live = useMemo(() => {
    let entered = 0;
    let absent = 0;
    let passed = 0;
    let failed = 0;
    const scores: number[] = [];

    for (const row of rows) {
      const state = stateFor(row);

      if (state.absent) {
        absent += 1;
        continue;
      }
      if (state.marks === null || !Number.isFinite(state.marks)) continue;

      entered += 1;
      scores.push(state.marks);
      if (state.marks >= paper.pass_marks) passed += 1;
      else failed += 1;
    }

    return {
      entered,
      absent,
      passed,
      failed,
      unmarked: rows.length - entered - absent,
      average: scores.length
        ? Math.round((scores.reduce((t, s) => t + s, 0) / scores.length) * 100) / 100
        : null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, drafts, paper.pass_marks]);

  const changed = Object.entries(drafts).filter(([studentId, draft]) => {
    const row = rows.find((entry) => entry.student_id === Number(studentId));
    if (!row) return false;
    return row.marks_obtained !== draft.marks || row.is_absent !== draft.absent;
  });

  /** Marks above the paper's ceiling — blocked before the request goes out. */
  const invalid = changed.filter(
    ([, draft]) => !draft.absent && draft.marks !== null && draft.marks > paper.max_marks,
  );

  const handleSave = () => {
    onSave(
      changed.map(([studentId, draft]) => ({
        student_id: Number(studentId),
        marks_obtained: draft.absent ? null : draft.marks,
        is_absent: draft.absent,
        remarks: '',
      })),
    );
    setDrafts({});
  };

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load this marks sheet">
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
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <div className="grid grid-cols-2 gap-4 border-b border-slate-200 px-4 py-3 sm:grid-cols-6 sm:px-6">
        <Stat label="Students" value={String(rows.length)} />
        <Stat label="Entered" value={String(live.entered)} />
        <Stat
          label="Not entered"
          value={String(live.unmarked)}
          tone={live.unmarked > 0 ? 'text-amber-700' : undefined}
        />
        <Stat label="Absent" value={String(live.absent)} />
        <Stat label="Passed" value={String(live.passed)} tone="text-emerald-700" />
        <Stat
          label="Failed"
          value={String(live.failed)}
          tone={live.failed > 0 ? 'text-red-700' : undefined}
        />
      </div>

      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Find by name, roll or admission no…"
          aria-label="Find a student"
          leftIcon={<Search className="size-4" />}
          className="sm:max-w-sm"
        />

        <p className="text-xs text-slate-500">
          Out of {paper.max_marks} · pass mark {paper.pass_marks}
          {live.average !== null && ` · average ${live.average}`}
        </p>
      </div>

      <CardBody className="p-0">
        {visible.length === 0 ? (
          <EmptyState
            icon={<UserX className="size-6" />}
            title={search ? 'Nobody matches that search' : 'No students in scope'}
            description={
              search ? 'Try a different name or number.' : 'This class and section has no active students.'
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((row) => {
              const state = stateFor(row);
              const isDirty =
                drafts[row.student_id] !== undefined &&
                (row.marks_obtained !== state.marks || row.is_absent !== state.absent);

              const over =
                !state.absent && state.marks !== null && state.marks > paper.max_marks;

              const percent =
                !state.absent && state.marks !== null && !over
                  ? percentFor(state.marks, paper.max_marks)
                  : null;

              return (
                <li
                  key={row.student_id}
                  className={cn(
                    'flex flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6',
                    isDirty && 'bg-brand-50/40',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={row.student_name} src={row.photo_url} size="sm" />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {row.student_name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        <code>{row.admission_no}</code>
                        {row.roll_no && ` · roll ${row.roll_no}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {percent !== null && (
                      <Badge tone={toneForGrade(gradeFor(percent))}>
                        {gradeFor(percent)} · {percent}%
                      </Badge>
                    )}

                    {isDirty && <span className="text-xs text-brand-600">unsaved</span>}

                    <Input
                      type="number"
                      min={0}
                      max={paper.max_marks}
                      step={0.5}
                      inputMode="decimal"
                      aria-label={`Marks for ${row.student_name}`}
                      disabled={!canEnter || state.absent}
                      hasError={over}
                      value={state.marks ?? ''}
                      onChange={(event) =>
                        setDraft(row.student_id, {
                          marks: event.target.value === '' ? null : Number(event.target.value),
                        })
                      }
                      className="w-24 text-right"
                    />

                    <Checkbox
                      id={`absent-${row.student_id}`}
                      label="Absent"
                      checked={state.absent}
                      disabled={!canEnter}
                      onChange={(event) =>
                        // Marks and absence are mutually exclusive — ticking
                        // absent clears whatever was typed.
                        setDraft(row.student_id, {
                          absent: event.target.checked,
                          ...(event.target.checked ? { marks: null } : {}),
                        })
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>

      {canEnter && (
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
              disabled={changed.length === 0 || invalid.length > 0}
              leftIcon={<Save className="size-4" />}
            >
              Save marks
            </Button>
          </div>
        </CardFooter>
      )}

      {invalid.length > 0 && (
        <div className="border-t border-slate-200 px-4 py-3 sm:px-6">
          <Alert tone="danger" title="Some marks are above the maximum">
            {invalid.length} student{invalid.length === 1 ? '' : 's'} have more than{' '}
            {paper.max_marks}. Correct them before saving.
          </Alert>
        </div>
      )}

      {!canEnter && (
        <CardFooter>
          <span className="text-xs text-slate-500">
            You have read-only access to marks. {summary.entered} of {summary.total} entered.
          </span>
        </CardFooter>
      )}
    </Card>
  );
}
