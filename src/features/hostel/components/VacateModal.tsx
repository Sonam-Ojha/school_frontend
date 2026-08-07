import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { todayInputValue } from '@/lib/format';

import { useVacateBed } from '../hooks/useHostel';
import { vacateSchema, type VacateInput } from '../schemas';

interface VacateModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocationId: number;
  studentName: string;
  location: string;
}

/**
 * End a stay.
 *
 * The allocation is kept rather than deleted: it is the record of who slept
 * where, which is exactly what somebody asks for months later. Only the bed
 * is freed.
 */
export function VacateModal({
  isOpen,
  onClose,
  allocationId,
  studentName,
  location,
}: VacateModalProps) {
  const vacate = useVacateBed();

  const form = useForm<VacateInput>({
    resolver: zodResolver(vacateSchema),
    defaultValues: {
      allocation_id: allocationId,
      vacated_on: todayInputValue(),
      reason: '',
    },
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
      title="Vacate this bed"
      description={`${studentName} · ${location}`}
      closeOnOverlayClick={!vacate.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={vacate.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="vacate-form"
            variant="danger"
            isLoading={vacate.isPending}
          >
            Vacate
          </Button>
        </>
      }
    >
      <Form
        id="vacate-form"
        form={form}
        onSubmit={(values) =>
          vacate.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, ['vacated_on', 'reason'])) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <FormGrid cols={1}>
          <FormInput<VacateInput>
            name="vacated_on"
            type="date"
            label="Left on"
            max={todayInputValue()}
            required
          />

          <FormFullRow>
            <FormTextarea<VacateInput>
              name="reason"
              label="Reason"
              rows={2}
              placeholder="Day scholar from this term"
            />
          </FormFullRow>
        </FormGrid>

        <Alert tone="info">
          The bed frees up immediately and the monthly charge stops. The stay itself is kept —
          somebody will ask who was in this bed last term.
        </Alert>
      </Form>
    </Modal>
  );
}
