import { zodResolver } from '@hookform/resolvers/zod';
import { Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { formatDate } from '@/lib/format';

import { DAY_PORTION_LABELS, LONG_LEAVE_DAYS } from '../constants';
import { useBalance, useReviewApplication } from '../hooks/useLeave';
import { reviewSchema, type ReviewInput } from '../schemas';
import type { LeaveApplication } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: LeaveApplication;
  /** Which button was pressed. The form still lets it be changed. */
  decision: 'approved' | 'rejected';
}

/**
 * Decide on an application.
 *
 * The balance is shown next to the decision because it is the thing that
 * makes it: granting somebody their fourteenth casual day out of twelve is a
 * decision, and it should be a visible one rather than an accident.
 */
export function ReviewModal({ isOpen, onClose, application, decision }: ReviewModalProps) {
  const review = useReviewApplication();
  const { data: balance } = useBalance(application.applicant_type, application.applicant_id);

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      application_id: application.id,
      decision,
      note: '',
    },
  });

  const current = form.watch('decision');
  const entitlement = balance?.entitlements.find(
    (entry) => entry.leave_type_id === application.leave_type_id,
  );

  const wouldExceed =
    entitlement?.quota !== null &&
    entitlement?.quota !== undefined &&
    entitlement.taken + application.days > entitlement.quota;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title={current === 'approved' ? 'Approve this leave?' : 'Refuse this leave?'}
      description={`${application.applicant_name} · ${application.leave_type_name}`}
      closeOnOverlayClick={!review.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={review.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="review-form"
            variant={current === 'approved' ? 'primary' : 'danger'}
            isLoading={review.isPending}
            leftIcon={
              current === 'approved' ? <Check className="size-4" /> : <X className="size-4" />
            }
          >
            {current === 'approved' ? 'Approve' : 'Refuse'}
          </Button>
        </>
      }
    >
      <Form
        id="review-form"
        form={form}
        onSubmit={(values) =>
          review.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, ['decision', 'note'])) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
          <Avatar
            name={application.applicant_name}
            src={application.photo_url}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-900">{application.applicant_name}</p>
            <p className="truncate text-xs text-slate-500">
              <code>{application.applicant_identifier}</code>
              {application.applicant_detail ? ` · ${application.applicant_detail}` : ''}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {formatDate(application.from_date)}
              {application.from_date !== application.to_date &&
                ` to ${formatDate(application.to_date)}`}{' '}
              ·{' '}
              <strong>
                {application.days} day{application.days === 1 ? '' : 's'}
              </strong>
              {application.day_portion !== 'full' &&
                ` (${DAY_PORTION_LABELS[application.day_portion].toLowerCase()})`}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-slate-600">Their reason</p>
          <p className="text-sm whitespace-pre-wrap text-slate-800">{application.reason}</p>
          {application.document_name && (
            <p className="mt-1.5 text-xs text-slate-500">
              Attached: <code>{application.document_name}</code>
            </p>
          )}
        </div>

        {entitlement && entitlement.quota !== null && (
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs font-medium text-slate-600">
              {entitlement.leave_type_name} balance
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge tone="neutral">{entitlement.quota} a year</Badge>
              <Badge tone="info">{entitlement.taken} taken</Badge>
              <Badge tone="warning">{entitlement.pending} awaiting</Badge>
              <Badge tone={(entitlement.available ?? 0) > 0 ? 'success' : 'danger'}>
                {entitlement.available} left
              </Badge>
            </div>
          </div>
        )}

        <FormGrid cols={1}>
          <FormFullRow>
            <FormTextarea<ReviewInput>
              name="note"
              label={current === 'approved' ? 'Note' : 'Why it is being refused'}
              rows={3}
              placeholder={
                current === 'approved'
                  ? 'Optional — anything the applicant should know'
                  : 'Examinations that week; please reschedule'
              }
              required={current === 'rejected'}
            />
          </FormFullRow>
        </FormGrid>

        {wouldExceed && current === 'approved' && (
          <Alert tone="warning" title="This takes them past their entitlement">
            {entitlement?.taken} of {entitlement?.quota} days are already used. Approving this
            makes {(entitlement?.taken ?? 0) + application.days}.
          </Alert>
        )}

        {application.days > LONG_LEAVE_DAYS && current === 'approved' && (
          <Alert tone="info">
            {application.days} consecutive days — worth checking who covers the work.
          </Alert>
        )}

        {application.has_started && (
          <Alert tone="warning" title="This leave has already begun">
            The first day was {formatDate(application.from_date)}. Once approved it cannot be
            cancelled, only recorded as it happened.
          </Alert>
        )}

        {current === 'rejected' && (
          <Alert tone="info">
            A refusal without a reason is a refusal nobody can appeal, so the note is required.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
