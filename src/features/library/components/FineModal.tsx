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

import { usePayFine, useWaiveFine } from '../hooks/useLibrary';
import {
  finePaymentSchema,
  fineWaiverSchema,
  type FinePaymentInput,
  type FineWaiverInput,
} from '../schemas';
import type { Loan } from '../types';

interface FineModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  /** Collecting money and writing it off are different rights and different forms. */
  mode: 'pay' | 'waive';
}

export function FineModal({ isOpen, onClose, loan, mode }: FineModalProps) {
  return mode === 'pay' ? (
    <PayFineForm isOpen={isOpen} onClose={onClose} loan={loan} />
  ) : (
    <WaiveFineForm isOpen={isOpen} onClose={onClose} loan={loan} />
  );
}

function PayFineForm({
  isOpen,
  onClose,
  loan,
}: {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
}) {
  const payFine = usePayFine();

  const form = useForm<FinePaymentInput>({
    resolver: zodResolver(finePaymentSchema),
    defaultValues: { loan_id: loan.id, amount: loan.fine_due, remarks: '' },
  });

  const amount = form.watch('amount');
  const isPartial = Number.isFinite(amount) && amount > 0 && amount < loan.fine_due;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title="Collect fine"
      description={`${loan.member_name} · ${loan.book_title}`}
      closeOnOverlayClick={!payFine.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={payFine.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="pay-fine-form" isLoading={payFine.isPending}>
            Collect
          </Button>
        </>
      }
    >
      <Form
        id="pay-fine-form"
        form={form}
        onSubmit={(values) =>
          payFine.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, ['amount', 'remarks'])) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <p className="text-sm text-slate-600">
          Outstanding: <strong className="text-slate-900">{formatCurrency(loan.fine_due)}</strong>
        </p>

        <FormGrid cols={1}>
          <FormInput<FinePaymentInput>
            name="amount"
            type="number"
            label="Amount"
            min={0.01}
            max={loan.fine_due}
            step="0.01"
            required
          />
          <FormTextarea<FinePaymentInput> name="remarks" label="Remarks" rows={2} />
        </FormGrid>

        {isPartial && (
          <Alert tone="info">
            {formatCurrency(loan.fine_due - amount)} will remain against this loan.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}

function WaiveFineForm({
  isOpen,
  onClose,
  loan,
}: {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
}) {
  const waiveFine = useWaiveFine();

  const form = useForm<FineWaiverInput>({
    resolver: zodResolver(fineWaiverSchema),
    defaultValues: { loan_id: loan.id, reason: '' },
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
      title="Waive this fine"
      description={`${loan.member_name} · ${loan.book_title}`}
      closeOnOverlayClick={!waiveFine.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={waiveFine.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="waive-fine-form"
            variant="danger"
            isLoading={waiveFine.isPending}
          >
            Waive {formatCurrency(loan.fine_due)}
          </Button>
        </>
      }
    >
      <Form
        id="waive-fine-form"
        form={form}
        onSubmit={(values) =>
          waiveFine.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, ['reason'])) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <FormFullRow>
          <FormTextarea<FineWaiverInput>
            name="reason"
            label="Reason"
            rows={3}
            placeholder="Book was returned during the library closure"
            required
          />
        </FormFullRow>

        <Alert tone="warning">
          The waiver is recorded against the loan with your name on it. A write-off without a
          reason is indistinguishable from a mistake.
        </Alert>
      </Form>
    </Modal>
  );
}
