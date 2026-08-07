import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Option } from '@/types/common';

import { FINE_PER_DAY } from '../constants';
import { useReturnBook } from '../hooks/useLibrary';
import { returnSchema, type ReturnInput } from '../schemas';
import type { Loan } from '../types';

const FIELDS = ['condition', 'collect_fine', 'remarks'] as const;

/** A book comes back in some state, or does not come back at all. */
const RETURN_CONDITION_OPTIONS: Option[] = [
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'Poor — damaged', value: 'poor' },
  { label: 'Not returned — lost', value: 'lost' },
];

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  onReturned?: (loan: Loan) => void;
}

export function ReturnModal({ isOpen, onClose, loan, onReturned }: ReturnModalProps) {
  const returnBook = useReturnBook();

  const form = useForm<ReturnInput>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      loan_id: loan.id,
      condition: 'good',
      // Pre-ticked when something is owed: the book and the money change hands
      // at the same counter, and an unticked box means chasing it later.
      collect_fine: loan.fine_due > 0,
      remarks: '',
    },
  });

  const condition = form.watch('condition');
  const isLost = condition === 'lost';

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: ReturnInput) => {
    returnBook.mutate(values, {
      onSuccess: (returned) => {
        onReturned?.(returned);
        handleClose();
      },
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Return this book"
      description={`${loan.book_title} · ${loan.member_name}`}
      closeOnOverlayClick={!returnBook.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={returnBook.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="return-form" isLoading={returnBook.isPending}>
            {isLost ? 'Record as lost' : 'Accept return'}
          </Button>
        </>
      }
    >
      <Form id="return-form" form={form} onSubmit={onSubmit}>
        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Issued</dt>
            <dd className="text-slate-900">{formatDate(loan.issued_on)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Due</dt>
            <dd className="text-slate-900">{formatDate(loan.due_on)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Overdue by</dt>
            <dd className={loan.days_overdue > 0 ? 'font-medium text-red-700' : 'text-slate-900'}>
              {loan.days_overdue > 0 ? `${loan.days_overdue} days` : 'Not overdue'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Fine</dt>
            <dd className={loan.fine_due > 0 ? 'font-semibold text-red-700' : 'text-slate-900'}>
              {formatCurrency(loan.fine_due)}
            </dd>
          </div>
        </dl>

        <FormGrid cols={2}>
          <FormSelect<ReturnInput>
            name="condition"
            label="Condition"
            options={RETURN_CONDITION_OPTIONS}
            required
          />

          {loan.fine_due > 0 && (
            <FormCheckbox<ReturnInput>
              name="collect_fine"
              label={`Collect ${formatCurrency(loan.fine_due)} now`}
              description="Leave unticked to let it stand against the member's account."
            />
          )}

          <FormFullRow>
            <FormTextarea<ReturnInput>
              name="remarks"
              label="Remarks"
              rows={2}
              placeholder={isLost ? 'What happened to it?' : 'Optional'}
            />
          </FormFullRow>
        </FormGrid>

        {loan.days_overdue > 0 && loan.fine_due > 0 && (
          <Alert tone="warning" title="Overdue">
            {loan.days_overdue} days at {formatCurrency(FINE_PER_DAY)} a day, capped at what the
            book costs to replace. The amount is fixed when the return is recorded and will not
            keep rising afterwards.
          </Alert>
        )}

        {isLost && (
          <Alert tone="danger" title="Recording this as lost">
            The copy leaves the shelf permanently and the fine becomes the book's replacement
            price. Say what happened in the remarks.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
