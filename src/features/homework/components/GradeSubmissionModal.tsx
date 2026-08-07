import { zodResolver } from '@hookform/resolvers/zod';
import { Award, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { AttachmentThumbnail } from '@/components/attachments';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { formatDateTime } from '@/lib/format';

import { SUBMISSION_STATUS_LABELS, SUBMISSION_STATUS_TONES } from '../constants';
import { useGradeSubmission, useUngradeSubmission } from '../hooks/useHomework';
import { gradeSchemaFor, type GradeInput } from '../schemas';
import type { HomeworkDetail, Submission } from '../types';

interface GradeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: HomeworkDetail;
  submission: Submission;
}

/**
 * Award marks and leave remarks on one submission.
 *
 * The mark ceiling comes from the homework, so the schema is built per
 * homework rather than shared — awarding 60 out of 50 is exactly the mistake
 * this prevents.
 */
export function GradeSubmissionModal({
  isOpen,
  onClose,
  homework,
  submission,
}: GradeSubmissionModalProps) {
  const gradeSubmission = useGradeSubmission(homework.id);
  const ungradeSubmission = useUngradeSubmission(homework.id);

  const schema = useMemo(() => gradeSchemaFor(homework.max_marks), [homework.max_marks]);

  const form = useForm<GradeInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      marks_obtained: submission.marks_obtained ?? 0,
      remarks: submission.remarks ?? '',
    },
  });

  const marks = form.watch('marks_obtained');
  const percent =
    Number.isFinite(marks) && homework.max_marks > 0
      ? Math.round((marks / homework.max_marks) * 100)
      : 0;

  const onSubmit = (values: GradeInput) => {
    gradeSubmission.mutate(
      { submissionId: submission.id, input: values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (applyServerErrors(error, form.setError, ['marks_obtained', 'remarks'])) return;
          form.setError('root.serverError', { type: 'server', message: error.message });
        },
      },
    );
  };

  const isGraded = submission.status === 'graded';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={`Grade ${submission.student_name}`}
      description={`${homework.title} — out of ${homework.max_marks}`}
      closeOnOverlayClick={!gradeSubmission.isPending}
      footer={
        <>
          {isGraded && (
            <Button
              variant="ghost"
              className="mr-auto text-red-600 hover:bg-red-50 hover:text-red-700"
              isLoading={ungradeSubmission.isPending}
              onClick={() => ungradeSubmission.mutate(submission.id, { onSuccess: onClose })}
              leftIcon={<RotateCcw className="size-4" />}
            >
              Remove grade
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={gradeSubmission.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="grade-form"
            isLoading={gradeSubmission.isPending}
            leftIcon={<Award className="size-4" />}
          >
            {isGraded ? 'Update grade' : 'Save grade'}
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
          </p>
        </div>

        <Badge tone={SUBMISSION_STATUS_TONES[submission.status]}>
          {SUBMISSION_STATUS_LABELS[submission.status]}
        </Badge>
      </div>

      {submission.days_late > 0 && (
        <Alert tone="warning" className="mb-4">
          Handed in {submission.days_late} day{submission.days_late === 1 ? '' : 's'} after the due
          date. Any penalty is yours to apply — the marks are not reduced automatically.
        </Alert>
      )}

      {submission.student_note && (
        <div className="mb-4 rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-medium text-slate-500">Note from the student</p>
          <p className="mt-1 text-sm text-slate-800">{submission.student_note}</p>
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
                <span className="min-w-0 truncate text-sm text-slate-700">
                  {attachment.file_name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Form id="grade-form" form={form} onSubmit={onSubmit}>
        <FormInput<GradeInput>
          name="marks_obtained"
          type="number"
          label={`Marks (out of ${homework.max_marks})`}
          min={0}
          max={homework.max_marks}
          step={0.5}
          hint={Number.isFinite(marks) ? `${percent}%` : undefined}
          autoFocus
          required
        />

        <FormTextarea<GradeInput>
          name="remarks"
          label="Remarks"
          rows={4}
          placeholder="What was good, and what to work on next time."
          hint="Optional — visible to the student and their guardian."
        />
      </Form>
    </Modal>
  );
}
