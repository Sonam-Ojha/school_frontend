import { zodResolver } from '@hookform/resolvers/zod';
import { Award, Download, RotateCcw, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AttachmentThumbnail } from '@/components/attachments';
import { Form } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { applyServerErrors } from '@/lib/formErrors';
import { formatBytes, formatDateTime } from '@/lib/format';

import {
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_TONES,
  gradeFor,
  toneForGrade,
} from '../constants';
import {
  useClearEvaluation,
  useDownloadSubmissionAttachment,
  useEvaluateSubmission,
} from '../hooks/useAssignments';
import { evaluationSchemaFor, type EvaluationInput } from '../schemas';
import type { AssignmentDetail, AssignmentSubmission } from '../types';

import { ReturnForRevisionModal } from './ReturnForRevisionModal';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentDetail;
  submission: AssignmentSubmission;
}

/** The single synthetic criterion used when an assignment has no rubric. */
const WHOLE_ASSIGNMENT = 0;

/**
 * Score one submission against the marking scheme.
 *
 * The ceilings come from the assignment and its rubric, so the schema is built
 * per assignment — awarding 12 for a criterion worth 10 is exactly what this
 * prevents. The running total, penalty and grade shown here mirror the
 * server's formula; the server still computes the stored values, so the two
 * can never disagree on the record itself.
 */
export function EvaluationModal({
  isOpen,
  onClose,
  assignment,
  submission,
}: EvaluationModalProps) {
  const evaluate = useEvaluateSubmission(assignment.id);
  const clearEvaluation = useClearEvaluation(assignment.id);
  const downloadAttachment = useDownloadSubmissionAttachment(assignment.id, submission.id);
  const returnModal = useDisclosure();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const schema = useMemo(() => evaluationSchemaFor(assignment), [assignment]);

  /** One row per criterion, or a single row worth the whole assignment. */
  const rows = useMemo(
    () =>
      assignment.rubric.length > 0
        ? assignment.rubric
        : [
            {
              id: WHOLE_ASSIGNMENT,
              name: 'Overall',
              description: null,
              max_marks: assignment.max_marks,
            },
          ],
    [assignment.rubric, assignment.max_marks],
  );

  const form = useForm<EvaluationInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      criteria_scores: rows.map((criterion) => {
        const existing = submission.evaluation?.criteria_scores.find(
          (score) => score.criterion_id === criterion.id,
        );
        return {
          criterion_id: criterion.id,
          marks_awarded: existing?.marks_awarded ?? 0,
          comment: existing?.comment ?? '',
        };
      }),
      feedback: submission.evaluation?.feedback ?? '',
      waive_late_penalty: submission.evaluation
        ? submission.evaluation.late_penalty === 0 && submission.days_late > 0
        : false,
    },
  });

  const scores = form.watch('criteria_scores');
  const waived = form.watch('waive_late_penalty');

  const rawMarks = (scores ?? []).reduce(
    (total, score) => total + (Number(score?.marks_awarded) || 0),
    0,
  );

  // Mirrors the backend: a percentage of the total per day, never taking the
  // result below zero.
  const penaltyPerDay = (assignment.max_marks * assignment.late_penalty_percent) / 100;
  const latePenalty =
    waived || submission.days_late === 0
      ? 0
      : Math.min(rawMarks, Math.round(penaltyPerDay * submission.days_late * 100) / 100);

  const finalMarks = Math.max(0, Math.round((rawMarks - latePenalty) * 100) / 100);
  const percentage =
    assignment.max_marks > 0 ? Math.round((finalMarks / assignment.max_marks) * 1000) / 10 : 0;
  const grade = gradeFor(percentage);

  const onSubmit = (values: EvaluationInput) => {
    evaluate.mutate(
      { submissionId: submission.id, input: values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (applyServerErrors(error, form.setError)) return;
          form.setError('root.serverError', { type: 'server', message: error.message });
        },
      },
    );
  };

  const isEvaluated = submission.evaluation !== null;
  const canPenalise = submission.days_late > 0 && assignment.late_penalty_percent > 0;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        title={`Evaluate ${submission.student_name}`}
        description={`${assignment.title} — out of ${assignment.max_marks}`}
        closeOnOverlayClick={!evaluate.isPending}
        footer={
          <>
            {isEvaluated && (
              <Button
                variant="ghost"
                className="mr-auto text-red-600 hover:bg-red-50 hover:text-red-700"
                isLoading={clearEvaluation.isPending}
                onClick={() => clearEvaluation.mutate(submission.id, { onSuccess: onClose })}
                leftIcon={<RotateCcw className="size-4" />}
              >
                Clear evaluation
              </Button>
            )}
            <Button
              variant="outline"
              onClick={returnModal.open}
              disabled={evaluate.isPending}
              leftIcon={<Undo2 className="size-4" />}
            >
              Return for revision
            </Button>
            <Button variant="outline" onClick={onClose} disabled={evaluate.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="evaluation-form"
              isLoading={evaluate.isPending}
              leftIcon={<Award className="size-4" />}
            >
              {isEvaluated ? 'Update evaluation' : 'Save evaluation'}
            </Button>
          </>
        }
      >
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <Avatar name={submission.student_name} src={submission.photo_url} size="md" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{submission.student_name}</p>
            <p className="truncate text-xs text-slate-500">
              <code>{submission.admission_no}</code>
              {submission.submitted_at && ` · handed in ${formatDateTime(submission.submitted_at)}`}
              {submission.attempt > 1 && ` · attempt ${submission.attempt}`}
            </p>
          </div>

          <Badge tone={SUBMISSION_STATUS_TONES[submission.status]}>
            {SUBMISSION_STATUS_LABELS[submission.status]}
          </Badge>
        </div>

        {submission.days_late > 0 && (
          <Alert tone="warning" className="mb-4" title={`${submission.days_late} day${submission.days_late === 1 ? '' : 's'} late`}>
            {canPenalise
              ? `The scheme docks ${assignment.late_penalty_percent}% of ${assignment.max_marks} per day — ${latePenalty || penaltyPerDay * submission.days_late} marks. Waive it below if the delay was agreed.`
              : 'No daily penalty is set for this assignment, so the marks are unaffected.'}
          </Alert>
        )}

        {submission.student_note && (
          <div className="mb-4 rounded-lg border border-slate-200 p-3">
            <p className="text-xs font-medium text-slate-500">Note from the student</p>
            <p className="mt-1 text-sm whitespace-pre-wrap text-slate-800">
              {submission.student_note}
            </p>
          </div>
        )}

        {submission.attachments.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Submitted work ({submission.attachments.length})
            </p>
            <ul className="space-y-2">
              {submission.attachments.map((attachment) => (
                <li key={attachment.id} className="flex items-center gap-2">
                  <AttachmentThumbnail attachment={attachment} className="size-9" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-700">
                      {attachment.file_name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {formatBytes(attachment.size_bytes)}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Download ${attachment.file_name}`}
                    isLoading={downloadAttachment.isPending && downloadingId === attachment.id}
                    onClick={() => {
                      setDownloadingId(attachment.id);
                      downloadAttachment.mutate(attachment, {
                        onSettled: () => setDownloadingId(null),
                      });
                    }}
                    leftIcon={<Download className="size-4" />}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <Form id="evaluation-form" form={form} onSubmit={onSubmit}>
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">
              {assignment.rubric.length > 0 ? 'Marking scheme' : 'Marks'}
            </p>

            <ul className="space-y-3">
              {rows.map((criterion, index) => (
                <li
                  key={criterion.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_7rem] sm:items-start"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{criterion.name}</p>
                    {criterion.description && (
                      <p className="mt-0.5 text-xs text-slate-500">{criterion.description}</p>
                    )}

                    <div className="mt-2">
                      <FormInput<EvaluationInput>
                        name={`criteria_scores.${index}.comment`}
                        placeholder="Comment on this criterion (optional)"
                      />
                    </div>
                  </div>

                  <FormInput<EvaluationInput>
                    name={`criteria_scores.${index}.marks_awarded`}
                    type="number"
                    label={`Out of ${criterion.max_marks}`}
                    min={0}
                    max={criterion.max_marks}
                    step={0.5}
                    autoFocus={index === 0}
                    required
                  />
                </li>
              ))}
            </ul>
          </div>

          {canPenalise && (
            <FormCheckbox<EvaluationInput>
              name="waive_late_penalty"
              label="Waive the late penalty"
              description="Use when the delay was agreed in advance, or excused. Recorded against the evaluation."
            />
          )}

          {/* The running total, in the same terms the student will see it. */}
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">Total awarded</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {finalMarks}
                  <span className="text-base font-normal text-slate-400">
                    {' '}
                    / {assignment.max_marks}
                  </span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">{percentage}%</p>
                <Badge tone={toneForGrade(grade)}>Grade {grade}</Badge>
              </div>
            </div>

            {latePenalty > 0 && (
              <p className="mt-2 border-t border-slate-200 pt-2 text-xs text-amber-700">
                {rawMarks} awarded by the scheme, less {latePenalty} for {submission.days_late} day
                {submission.days_late === 1 ? '' : 's'} late.
              </p>
            )}

            {rawMarks > assignment.max_marks && (
              <p className={cn('mt-2 text-xs font-medium text-red-600')}>
                The criteria add up to more than this assignment is worth.
              </p>
            )}
          </div>

          <FormTextarea<EvaluationInput>
            name="feedback"
            label="Feedback"
            rows={4}
            placeholder="What worked, what did not, and what to do differently next time."
            hint="Optional here — released to the student when you publish the marks."
          />
        </Form>
      </Modal>

      <ReturnForRevisionModal
        isOpen={returnModal.isOpen}
        onClose={returnModal.close}
        assignmentId={assignment.id}
        submission={submission}
        onReturned={onClose}
      />
    </>
  );
}
