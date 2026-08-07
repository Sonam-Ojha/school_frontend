import { zodResolver } from '@hookform/resolvers/zod';
import { Undo2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { useReturnForRevision } from '../hooks/useAssignments';
import { returnForRevisionSchema, type ReturnForRevisionInput } from '../schemas';
import type { AssignmentSubmission } from '../types';

interface ReturnForRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: number;
  submission: AssignmentSubmission;
  /** Closes the evaluation screen behind this one once the work goes back. */
  onReturned?: () => void;
}

/**
 * Hands work back to be done again.
 *
 * Feedback is mandatory here, unlike on an evaluation: "resubmit this" is not
 * something a student can act on without being told what was wrong with it.
 */
export function ReturnForRevisionModal({
  isOpen,
  onClose,
  assignmentId,
  submission,
  onReturned,
}: ReturnForRevisionModalProps) {
  const returnForRevision = useReturnForRevision(assignmentId);

  const form = useForm<ReturnForRevisionInput>({
    resolver: zodResolver(returnForRevisionSchema),
    defaultValues: { feedback: submission.evaluation?.feedback ?? '' },
  });

  const onSubmit = (values: ReturnForRevisionInput) => {
    returnForRevision.mutate(
      { submissionId: submission.id, input: values },
      {
        onSuccess: () => {
          onClose();
          onReturned?.();
        },
        onError: (error) => {
          if (applyServerErrors(error, form.setError, ['feedback'])) return;
          form.setError('root.serverError', { type: 'server', message: error.message });
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={`Return ${submission.student_name}’s work`}
      description="They will be able to submit again."
      closeOnOverlayClick={!returnForRevision.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={returnForRevision.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="return-form"
            isLoading={returnForRevision.isPending}
            leftIcon={<Undo2 className="size-4" />}
          >
            Return for revision
          </Button>
        </>
      }
    >
      <Alert tone="info" className="mb-4">
        Any marks recorded so far are cleared and this becomes attempt {submission.attempt + 1}. The
        original files stay attached so nothing is lost.
      </Alert>

      <Form id="return-form" form={form} onSubmit={onSubmit}>
        <FormTextarea<ReturnForRevisionInput>
          name="feedback"
          label="What needs to change"
          rows={5}
          placeholder="Be specific — this is all the student has to work from."
          autoFocus
          required
        />
      </Form>
    </Modal>
  );
}
