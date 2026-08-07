import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { formatCurrency, toDateInputValue } from '@/lib/format';
import { allocateAcross, percentageOf, subtractAmounts, sumAmounts } from '@/lib/money';

import {
  PAYMENT_MODE_OPTIONS,
  REFERENCE_REQUIRED_MODES,
} from '../constants';
import { useDiscountOptions } from '../hooks/useFeeCatalogue';
import { useCollectPayment } from '../hooks/useCollection';
import { collectPaymentSchema, type CollectPaymentInput } from '../schemas';
import type { Payment, StudentFeeAccount } from '../types';

const FIELDS = ['amount', 'mode', 'reference', 'discount_id', 'fine_amount', 'paid_at', 'remarks'] as const;

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: StudentFeeAccount;
  onCollected: (payment: Payment) => void;
}

/**
 * Take a payment against a student's dues.
 *
 * The preview below the form shows how the amount will land across
 * instalments, oldest first — the same rule the backend applies. It is a
 * preview only: the real allocation happens server-side inside the
 * transaction that writes the receipt, because a concurrent payment would
 * race any split computed here.
 */
export function CollectPaymentModal({
  isOpen,
  onClose,
  account,
  onCollected,
}: CollectPaymentModalProps) {
  const collectPayment = useCollectPayment();
  const { discounts, discountOptions } = useDiscountOptions();

  /** Unsettled dues, oldest first — the order the money is applied in. */
  const outstanding = useMemo(
    () =>
      account.dues
        .filter((due) => due.balance > 0)
        .sort((a, b) => a.due_date.localeCompare(b.due_date)),
    [account.dues],
  );

  const form = useForm<CollectPaymentInput>({
    resolver: zodResolver(collectPaymentSchema),
    defaultValues: {
      student_id: account.student_id,
      amount: account.balance,
      mode: 'cash',
      reference: '',
      discount_id: null,
      fine_amount: 0,
      paid_at: toDateInputValue(new Date()),
      remarks: '',
    },
  });

  const amount = form.watch('amount');
  const mode = form.watch('mode');
  const discountId = form.watch('discount_id');
  const fine = form.watch('fine_amount');

  const selectedDiscount = discounts.find((discount) => discount.id === discountId);

  /** What the discount takes off the outstanding balance. */
  const discountAmount = useMemo(() => {
    if (!selectedDiscount) return 0;
    return selectedDiscount.value_type === 'percentage'
      ? percentageOf(account.balance, selectedDiscount.value)
      : Math.min(selectedDiscount.value, account.balance);
  }, [selectedDiscount, account.balance]);

  /** Balance after the discount and any fine the collector added. */
  const netDue = useMemo(
    () => sumAmounts([subtractAmounts(account.balance, discountAmount), Number.isFinite(fine) ? fine : 0]),
    [account.balance, discountAmount, fine],
  );

  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const { allocations, unallocated } = useMemo(
    () => allocateAcross(safeAmount, outstanding.map((due) => ({ id: due.id, balance: due.balance }))),
    [safeAmount, outstanding],
  );

  const isOverpaying = unallocated > 0;
  const remainingAfter = subtractAmounts(netDue, safeAmount);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: CollectPaymentInput) => {
    collectPayment.mutate(values, {
      onSuccess: (payment) => {
        handleClose();
        onCollected(payment);
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
      size="lg"
      title={`Collect from ${account.student_name}`}
      description={`Outstanding balance ${formatCurrency(account.balance)}`}
      closeOnOverlayClick={!collectPayment.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={collectPayment.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="collect-payment-form"
            isLoading={collectPayment.isPending}
            leftIcon={<Wallet className="size-4" />}
          >
            Collect {formatCurrency(safeAmount)}
          </Button>
        </>
      }
    >
      <Form id="collect-payment-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormSelect<CollectPaymentInput>
            name="discount_id"
            label="Discount"
            options={discountOptions}
            placeholder="No discount"
            valueAsNumber
            hint={
              selectedDiscount
                ? `Reduces the balance by ${formatCurrency(discountAmount)}`
                : 'Optional concession'
            }
          />
          <FormInput<CollectPaymentInput>
            name="fine_amount"
            type="number"
            label="Additional fine"
            min={0}
            step={0.01}
            hint="Overdue fines are already included in the balance."
          />

          <FormInput<CollectPaymentInput>
            name="amount"
            type="number"
            label="Amount received"
            min={0}
            step={0.01}
            hint={`Net due after discount and fine: ${formatCurrency(netDue)}`}
            required
          />
          <FormInput<CollectPaymentInput>
            name="paid_at"
            type="date"
            label="Payment date"
            max={toDateInputValue(new Date())}
            required
          />

          <FormSelect<CollectPaymentInput>
            name="mode"
            label="Payment mode"
            options={PAYMENT_MODE_OPTIONS}
            required
          />
          <FormInput<CollectPaymentInput>
            name="reference"
            label="Reference"
            placeholder="Cheque no. / UPI ref / txn id"
            hint={
              REFERENCE_REQUIRED_MODES.includes(mode)
                ? 'Required for this mode'
                : 'Not needed for cash'
            }
            required={REFERENCE_REQUIRED_MODES.includes(mode)}
          />

          <FormFullRow>
            <FormTextarea<CollectPaymentInput> name="remarks" label="Remarks" rows={2} />
          </FormFullRow>
        </FormGrid>

        {/* How the money lands. Mirrors the backend's oldest-first rule so the
            cashier can tell a parent which instalment they just cleared. */}
        <div className="rounded-lg border border-slate-200">
          <p className="border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
            This payment settles
          </p>

          {allocations.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">
              Enter an amount to see which instalments it clears.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {allocations.map((allocation) => {
                const due = outstanding.find((entry) => entry.id === allocation.id);
                if (!due) return null;

                const clearsIt = allocation.amount >= due.balance;

                return (
                  <li
                    key={allocation.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate text-slate-700">
                      {due.installment_name}
                      <span className="ml-2 text-xs text-slate-400">
                        {clearsIt ? 'cleared' : 'part payment'}
                      </span>
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(allocation.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {isOverpaying && (
          <Alert tone="warning" title="More than is owed">
            {formatCurrency(unallocated)} exceeds the outstanding balance and cannot be allocated
            to any instalment. Reduce the amount, or record the excess as an advance separately.
          </Alert>
        )}

        {!isOverpaying && remainingAfter > 0 && (
          <Alert tone="info">
            {formatCurrency(remainingAfter)} will remain outstanding after this payment.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
