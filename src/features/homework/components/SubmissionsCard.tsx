import { Award, CheckCheck, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AttachmentThumbnail } from '@/components/attachments';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import {
  HOMEWORK_PERMISSIONS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_OPTIONS,
  SUBMISSION_STATUS_TONES,
} from '../constants';
import { useRecordSubmission, useSubmissions } from '../hooks/useHomework';
import type { HomeworkDetail, Submission } from '../types';

import { GradeSubmissionModal } from './GradeSubmissionModal';

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn('mt-0.5 text-lg font-semibold', tone ?? 'text-slate-900')}>{value}</p>
    </div>
  );
}

/**
 * Who has handed in, and what it scored.
 *
 * A row exists for every student in scope from the moment the homework is
 * published — "not handed in" is a state the teacher needs to see, and a list
 * of only-those-who-submitted cannot show it.
 */
export function SubmissionsCard({ homework }: { homework: HomeworkDetail }) {
  const { data, isLoading, error } = useSubmissions(homework.id);
  const recordSubmission = useRecordSubmission(homework.id);
  const canGrade = useAuthStore((state) => state.hasPermission)(HOMEWORK_PERMISSIONS.grade);

  const gradeModal = useDisclosure();
  const [grading, setGrading] = useState<Submission | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [recordingId, setRecordingId] = useState<number | null>(null);

  const submissions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (data?.data ?? []).filter((submission) => {
      if (statusFilter && submission.status !== statusFilter) return false;
      if (!term) return true;
      return [submission.student_name, submission.admission_no]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [data?.data, search, statusFilter]);

  if (homework.status === 'draft') {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<Users className="size-6" />}
            title="Not published yet"
            description="Submission rows are raised for each student the moment this homework is published."
          />
        </CardBody>
      </Card>
    );
  }

  const summary = data?.summary;

  return (
    <>
      <div className="space-y-4">
        {summary && (
          <Card>
            <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <Stat label="Students" value={String(summary.total)} />
              <Stat
                label="Not handed in"
                value={String(summary.pending)}
                tone={summary.pending > 0 ? 'text-amber-700' : undefined}
              />
              <Stat label="Submitted" value={String(summary.submitted + summary.late)} />
              <Stat label="Graded" value={String(summary.graded)} tone="text-emerald-700" />
              <Stat
                label="Average"
                value={
                  summary.average_marks === null
                    ? '—'
                    : `${summary.average_marks} / ${homework.max_marks}`
                }
              />
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader
            title="Submissions"
            description="Grade what has been handed in, and chase what has not."
          />

          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a student…"
              aria-label="Find a student"
              leftIcon={<Search className="size-4" />}
              className="sm:max-w-xs"
            />
            <Select
              aria-label="Filter by status"
              value={statusFilter}
              options={SUBMISSION_STATUS_OPTIONS}
              placeholder="All statuses"
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 w-auto min-w-40 text-sm"
            />
          </div>

          <CardBody className="p-0">
            {error ? (
              <div className="p-4 sm:p-6">
                <Alert tone="danger" title="Could not load submissions">
                  {error.message}
                </Alert>
              </div>
            ) : isLoading ? (
              <ul className="divide-y divide-slate-100">
                {Array.from({ length: 6 }, (_, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                    <Skeleton className="size-9 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-8 w-24" />
                  </li>
                ))}
              </ul>
            ) : submissions.length === 0 ? (
              <EmptyState
                icon={<Users className="size-6" />}
                title={search || statusFilter ? 'Nobody matches' : 'No students in scope'}
                description={
                  search || statusFilter
                    ? 'Try a different name or clear the filter.'
                    : 'This class and section has no active students.'
                }
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {submissions.map((submission) => {
                  const isPending = submission.status === 'pending';

                  return (
                    <li
                      key={submission.id}
                      className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar
                          name={submission.student_name}
                          src={submission.photo_url}
                          size="sm"
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {submission.student_name}
                            </p>
                            <Badge tone={SUBMISSION_STATUS_TONES[submission.status]}>
                              {SUBMISSION_STATUS_LABELS[submission.status]}
                            </Badge>
                            {submission.days_late > 0 && (
                              <span className="text-xs text-amber-700">
                                {submission.days_late}d late
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                            <code>{submission.admission_no}</code>
                            {submission.submitted_at && (
                              <span>{formatDateTime(submission.submitted_at)}</span>
                            )}
                            {submission.attachments.length > 0 && (
                              <span>
                                {submission.attachments.length} file
                                {submission.attachments.length === 1 ? '' : 's'}
                              </span>
                            )}
                          </p>

                          {submission.remarks && (
                            <p className="mt-1 truncate text-xs text-slate-600 italic">
                              “{submission.remarks}”
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        {submission.attachments.length > 0 && (
                          <div className="hidden items-center gap-1 sm:flex">
                            {submission.attachments.slice(0, 3).map((attachment) => (
                              <AttachmentThumbnail
                                key={attachment.id}
                                attachment={attachment}
                                className="size-8"
                              />
                            ))}
                          </div>
                        )}

                        {submission.marks_obtained !== null && (
                          <span className="text-sm font-semibold text-slate-900">
                            {submission.marks_obtained}
                            <span className="text-xs font-normal text-slate-400">
                              /{homework.max_marks}
                            </span>
                          </span>
                        )}

                        {/* Work handed in on paper still has to be marked
                            received before it can be graded. */}
                        {isPending && canGrade && homework.status === 'published' && (
                          <Button
                            variant="outline"
                            size="sm"
                            isLoading={recordSubmission.isPending && recordingId === submission.student_id}
                            onClick={() => {
                              setRecordingId(submission.student_id);
                              recordSubmission.mutate(
                                { studentId: submission.student_id, input: { student_note: '' } },
                                { onSettled: () => setRecordingId(null) },
                              );
                            }}
                            leftIcon={<CheckCheck className="size-4" />}
                          >
                            Handed in
                          </Button>
                        )}

                        {!isPending && canGrade && (
                          <Button
                            variant={submission.status === 'graded' ? 'ghost' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setGrading(submission);
                              gradeModal.open();
                            }}
                            leftIcon={<Award className="size-4" />}
                          >
                            {submission.status === 'graded' ? 'Regrade' : 'Grade'}
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {grading && (
        <GradeSubmissionModal
          // Remount per submission so `defaultValues` are applied.
          key={grading.id}
          isOpen={gradeModal.isOpen}
          onClose={gradeModal.close}
          homework={homework}
          submission={grading}
        />
      )}
    </>
  );
}
