import { Award, CheckCheck, Paperclip, Search, Users } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import {
  ALL_ACCEPTED_MIME_TYPES,
  ATTACHMENT_KIND_LABELS,
  AttachmentThumbnail,
  MAX_BYTES,
  kindForMime,
} from '@/components/attachments';
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
import { formatBytes, formatDateTime } from '@/lib/format';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';

import {
  ASSIGNMENT_PERMISSIONS,
  MAX_SUBMISSION_ATTACHMENTS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_OPTIONS,
  SUBMISSION_STATUS_TONES,
  toneForGrade,
} from '../constants';
import {
  useAddSubmissionAttachment,
  useAssignmentSubmissions,
  useRecordAssignmentSubmission,
} from '../hooks/useAssignments';
import type { AssignmentDetail, AssignmentSubmission } from '../types';

import { EvaluationModal } from './EvaluationModal';

interface SubmissionRowProps {
  assignment: AssignmentDetail;
  submission: AssignmentSubmission;
  canEvaluate: boolean;
  onEvaluate: (submission: AssignmentSubmission) => void;
}

/**
 * One student's line.
 *
 * A row per student, not per hand-in: "not handed in" is the state a teacher
 * needs to chase, and a list of only-those-who-submitted cannot show it.
 */
function SubmissionRow({ assignment, submission, canEvaluate, onEvaluate }: SubmissionRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const recordSubmission = useRecordAssignmentSubmission(assignment.id);
  const addAttachment = useAddSubmissionAttachment(assignment.id, submission.id);

  const isPending = submission.status === 'pending';
  const isReturned = submission.status === 'returned';
  const isOpen = assignment.status === 'published';
  const evaluation = submission.evaluation;

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (submission.attachments.length >= MAX_SUBMISSION_ATTACHMENTS) {
      toast.error(
        'No room for another file',
        `A submission may carry at most ${MAX_SUBMISSION_ATTACHMENTS} files.`,
      );
      return;
    }

    if (!ALL_ACCEPTED_MIME_TYPES.includes(file.type)) {
      toast.error('Unsupported file', `${file.name} is not a PDF, image or video.`);
      return;
    }

    const kind = kindForMime(file.type);
    if (file.size > MAX_BYTES[kind]) {
      toast.error(
        'File too large',
        `${file.name} exceeds the ${formatBytes(MAX_BYTES[kind])} limit for ${ATTACHMENT_KIND_LABELS[kind].toLowerCase()}s.`,
      );
      return;
    }

    addAttachment.mutate(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={submission.student_name} src={submission.photo_url} size="sm" />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-slate-900">{submission.student_name}</p>
            <Badge tone={SUBMISSION_STATUS_TONES[submission.status]}>
              {SUBMISSION_STATUS_LABELS[submission.status]}
            </Badge>
            {submission.days_late > 0 && (
              <span className="text-xs text-amber-700">{submission.days_late}d late</span>
            )}
            {submission.attempt > 1 && (
              <span className="text-xs text-slate-500">attempt {submission.attempt}</span>
            )}
          </div>

          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
            <code>{submission.admission_no}</code>
            {submission.submitted_at && <span>{formatDateTime(submission.submitted_at)}</span>}
            {submission.attachments.length > 0 && (
              <span>
                {submission.attachments.length} file
                {submission.attachments.length === 1 ? '' : 's'}
              </span>
            )}
          </p>

          {evaluation?.feedback && (
            <p className="mt-1 truncate text-xs text-slate-600 italic">“{evaluation.feedback}”</p>
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

        {/* A returned submission carries feedback, not a result. */}
        {evaluation && !isReturned && (
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              {evaluation.final_marks}
              <span className="text-xs font-normal text-slate-400">/{assignment.max_marks}</span>
            </p>
            <Badge tone={toneForGrade(evaluation.grade)}>{evaluation.grade}</Badge>
          </div>
        )}

        {/* Models, posters and bound reports arrive on paper — they still have
            to be marked received before they can be evaluated. Returned work
            comes back the same way, as a fresh attempt. */}
        {(isPending || isReturned) && canEvaluate && isOpen && (
          <Button
            variant="outline"
            size="sm"
            isLoading={recordSubmission.isPending}
            onClick={() =>
              recordSubmission.mutate({ studentId: submission.student_id, input: { student_note: '' } })
            }
            leftIcon={<CheckCheck className="size-4" />}
          >
            {isReturned ? 'Handed in again' : 'Handed in'}
          </Button>
        )}

        {!isPending && canEvaluate && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={ALL_ACCEPTED_MIME_TYPES.join(',')}
              className="sr-only"
              onChange={(event) => handleFile(event.target.files)}
            />
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Attach a file to ${submission.student_name}’s submission`}
              isLoading={addAttachment.isPending}
              onClick={() => inputRef.current?.click()}
              leftIcon={<Paperclip className="size-4" />}
            />
            <Button
              variant={evaluation ? 'ghost' : 'outline'}
              size="sm"
              onClick={() => onEvaluate(submission)}
              leftIcon={<Award className="size-4" />}
            >
              {evaluation ? 'Re-evaluate' : 'Evaluate'}
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

/**
 * Who has handed in, and what it scored.
 *
 * Rows exist for every student in scope from the moment the assignment is
 * published; the marks summary that sits above this card is built from the
 * same response, so the two can never disagree.
 */
export function SubmissionsCard({ assignment }: { assignment: AssignmentDetail }) {
  const { data, isLoading, error } = useAssignmentSubmissions(assignment.id);
  const canEvaluate = useAuthStore((state) => state.hasPermission)(ASSIGNMENT_PERMISSIONS.evaluate);

  const evaluationModal = useDisclosure();
  const [evaluating, setEvaluating] = useState<AssignmentSubmission | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  if (assignment.status === 'draft') {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<Users className="size-6" />}
            title="Not published yet"
            description="Submission rows are raised for each student the moment this assignment is published."
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Submissions"
          description="Evaluate what has come in, and chase what has not."
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
            className="h-10 w-auto min-w-44 text-sm"
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
              {submissions.map((submission) => (
                <SubmissionRow
                  key={submission.id}
                  assignment={assignment}
                  submission={submission}
                  canEvaluate={canEvaluate}
                  onEvaluate={(next) => {
                    setEvaluating(next);
                    evaluationModal.open();
                  }}
                />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {evaluating && (
        <EvaluationModal
          // Remount per submission so `defaultValues` are applied.
          key={`${evaluating.id}-${evaluating.attempt}`}
          isOpen={evaluationModal.isOpen}
          onClose={evaluationModal.close}
          assignment={assignment}
          submission={evaluating}
        />
      )}
    </>
  );
}
