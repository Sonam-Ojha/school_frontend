import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { formatCurrency } from '@/lib/format';

import { useCreateRun, usePayrollSummary } from '../hooks/usePayroll';
import { runSchema, type RunInput } from '../schemas';
import type { PayrollRunDetail } from '../types';

/** `YYYY-MM` for the month just gone, which is the one usually being run. */
function lastMonth(): string {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
}

interface RunFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (run: PayrollRunDetail) => void;
}

export function RunFormModal({ isOpen, onClose, onCreated }: RunFormModalProps) {
  const createRun = useCreateRun();
  const { data: summary } = usePayrollSummary();

  const form = useForm<RunInput>({
    resolver: zodResolver(runSchema),
    defaultValues: { month: lastMonth(), notes: '' },
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
      title="Open a month's payroll"
      description="It starts as a draft. Nothing is costed until you process it."
      closeOnOverlayClick={!createRun.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={createRun.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="run-form" isLoading={createRun.isPending}>
            Open
          </Button>
        </>
      }
    >
      <Form
        id="run-form"
        form={form}
        onSubmit={(values) =>
          createRun.mutate(values, {
            onSuccess: (run) => {
              onCreated?.(run);
              handleClose();
            },
            onError: (error) => {
              if (applyServerErrors(error, form.setError, ['month', 'notes'])) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <FormGrid cols={1}>
          <FormInput<RunInput>
            name="month"
            type="month"
            label="Month"
            max={new Date().toISOString().slice(0, 7)}
            required
          />

          <FormFullRow>
            <FormTextarea<RunInput>
              name="notes"
              label="Notes"
              rows={2}
              placeholder="Includes the annual increment from this month"
            />
          </FormFullRow>
        </FormGrid>

        {summary && (
          <Alert tone="info">
            {summary.employees_on_payroll} employees are on the payroll, costing about{' '}
            {formatCurrency(summary.monthly_net)} net a month.
            {summary.employees_without_structure > 0 &&
              ` ${summary.employees_without_structure} have no salary on file and will be left out.`}
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
