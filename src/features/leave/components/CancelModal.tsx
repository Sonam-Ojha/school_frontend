import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { formatDate } from '@/lib/format';

import { useCancelApproval } from '../hooks/useLeave';
import { cancelSchema, type CancelInput } from '../schemas';
import type { LeaveApplication } from '../types';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: LeaveApplication;
}

/**
 * Undo an approval.
 *
 * Only before the leave begins. Once the first day has passed the person was
 * either there or not, and a record saying otherwise is a record that lies —
 * so the guard is on the API as well as the button.
 */
export function CancelModal({ isOpen, onClose, application }: CancelModalProps) {
  const cancel = useCancelApproval();

  const form = useForm<CancelInput>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { application_id: application.id, reason: '' },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title="Undo this approval"
      description={`${application.applicant_name} · ${application.leave_type_name}`}
      closeOnOverlayClick={!cancel.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={cancel.isPending}>
            Keep it
          </Button>
          <Button
            type="submit"
            form="cancel-leave-form"
            variant="danger"
            isLoading={cancel.isPending}
            disabled={application.has_started}
          >
            Undo approval
          </Button>
        </>
      }
    >
      <Form
        id="cancel-leave-form"
        form={form}
        onSubmit={(values) =>
          cancel.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, ['reason'])) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        {application.has_started ? (
          <Alert tone="danger" title="Too late to undo this">
            The leave began on {formatDate(application.from_date)}. They were either there or they
            were not, and changing the record now would not change that.
          </Alert>
        ) : (
          <Alert tone="warning">
            {application.days} day{application.days === 1 ? '' : 's'} go back on{' '}
            {application.applicant_name}&rsquo;s balance, and the attendance sheet stops treating
            those days as leave.
          </Alert>
        )}

        <FormGrid cols={1}>
          <FormFullRow>
            <FormTextarea<CancelInput>
              name="reason"
              label="Why"
              rows={3}
              placeholder="Examination duty reassigned; leave no longer needed"
              disabled={application.has_started}
              required
            />
          </FormFullRow>
        </FormGrid>
      </Form>
    </Modal>
  );
}
