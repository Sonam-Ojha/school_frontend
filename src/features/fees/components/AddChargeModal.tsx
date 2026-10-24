import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { todayInputValue } from '@/lib/format';

import { CHARGE_SUGGESTIONS } from '../constants';
import { useAddCharge } from '../hooks/useCollection';
import { addChargeSchema, type AddChargeInput } from '../schemas';

const FIELDS = ['label', 'amount', 'due_date'] as const;
const FORM_ID = 'add-charge-form';

interface AddChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
  /** Called with the new charge's due id, so the counter can tick it for payment. */
  onAdded?: (dueIds: number[]) => void;
}

/**
 * Something the office collects outside the fee structure — books, uniform,
 * a lost ID card. It becomes a due on the student's account, collected and
 * receipted like any instalment.
 */
export function AddChargeModal({ isOpen, onClose, studentId, studentName, onAdded }: AddChargeModalProps) {
  const addCharge = useAddCharge(studentId);
  const form = useForm<AddChargeInput>({
    resolver: zodResolver(addChargeSchema),
    defaultValues: { label: '', amount: Number.NaN, due_date: todayInputValue() },
  });

  const close = () => {
    form.reset({ label: '', amount: Number.NaN, due_date: todayInputValue() });
    onClose();
  };

  const submit = (values: AddChargeInput) =>
    addCharge.mutate(values, {
      onSuccess: ({ account }) => {
        const added = account.dues.filter((due) => due.kind === 'charge' && due.removable && due.installment_name === values.label.trim());
        onAdded?.(added.slice(-1).map((due) => due.id));
        close();
      },
      onError: (error) => {
        if (!applyServerErrors(error, form.setError, FIELDS)) {
          form.setError('root.serverError', { type: 'server', message: error.message });
        }
      },
    });

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="md"
      title="Add a charge"
      description={`Added to ${studentName}'s fee account and collected like any instalment.`}
      closeOnOverlayClick={!addCharge.isPending}
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={addCharge.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={addCharge.isPending}>
            Add charge
          </Button>
        </>
      }
    >
      <Form id={FORM_ID} form={form} onSubmit={submit}>
        <FormGrid cols={2}>
          <FormFullRow>
            <FormInput<AddChargeInput>
              name="label"
              label="What is it for?"
              placeholder="e.g. Books and notebooks"
              list="fee-charge-suggestions"
              autoFocus
              required
            />
            <datalist id="fee-charge-suggestions">
              {CHARGE_SUGGESTIONS.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </FormFullRow>
          <FormInput<AddChargeInput> name="amount" type="number" label="Amount (₹)" min={0} step={0.01} valueAsNumber required />
          <FormInput<AddChargeInput> name="due_date" type="date" label="Due on" required />
        </FormGrid>
      </Form>
    </Modal>
  );
}
