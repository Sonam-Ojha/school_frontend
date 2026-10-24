import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PAYMENT_MODE_OPTIONS, REFERENCE_LABELS } from '@/features/fees/constants';
import { applyServerErrors } from '@/lib/formErrors';
import { todayInputValue } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { EXPENSE_PERMISSIONS } from '../constants';
import { useExpenseCategories, useSaveExpense } from '../hooks/useExpenses';
import { expenseSchema, type ExpenseInput } from '../schemas';
import type { Expense } from '../types';

const FIELDS = ['date', 'category_id', 'amount', 'paid_to', 'mode', 'reference', 'bank_name', 'bill_no', 'description'] as const;
const FORM_ID = 'expense-form';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to record a new voucher. */
  expense?: Expense | null;
}

export function ExpenseFormModal({ isOpen, onClose, expense = null }: ExpenseFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={expense ? `Edit voucher ${expense.voucher_no}` : 'Record an expense'}
      description="A bill paid, supplies bought, a repair. Salaries are paid through the payroll, not here."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID}>
            {expense ? 'Save changes' : 'Record expense'}
          </Button>
        </>
      }
    >
      {/* Remounted per voucher so the form starts from that voucher. */}
      <ExpenseForm key={expense?.id ?? 'new'} expense={expense} onSaved={onClose} />
    </Modal>
  );
}

function ExpenseForm({ expense, onSaved }: { expense: Expense | null; onSaved: () => void }) {
  const save = useSaveExpense(expense?.id ?? null);
  const categories = useExpenseCategories();
  const canApprove = useAuthStore((state) => state.hasPermission(EXPENSE_PERMISSIONS.approve));
  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          date: expense.date,
          category_id: expense.category_id,
          amount: expense.amount,
          paid_to: expense.paid_to,
          mode: expense.mode,
          reference: expense.reference ?? '',
          bank_name: expense.bank_name ?? '',
          bill_no: expense.bill_no ?? '',
          description: expense.description ?? '',
        }
      : {
          date: todayInputValue(),
          category_id: Number.NaN,
          amount: Number.NaN,
          paid_to: '',
          mode: 'cash',
          reference: '',
          bank_name: '',
          bill_no: '',
          description: '',
        },
  });
  const mode = form.watch('mode');

  const options = (categories.data ?? [])
    .filter((category) => category.is_active || category.id === expense?.category_id)
    .map((category) => ({ label: category.name, value: category.id }));

  const submit = (values: ExpenseInput) =>
    save.mutate(
      {
        date: values.date,
        category_id: values.category_id,
        amount: values.amount,
        paid_to: values.paid_to.trim(),
        mode: values.mode,
        reference: values.mode === 'cash' ? null : values.reference.trim() || null,
        bank_name: values.mode === 'cash' ? null : values.bank_name.trim() || null,
        bill_no: values.bill_no.trim() || null,
        description: values.description.trim() || null,
      },
      {
        onSuccess: onSaved,
        onError: (error) => {
          if (!applyServerErrors(error, form.setError, FIELDS)) {
            form.setError('root.serverError', { type: 'server', message: error.message });
          }
        },
      },
    );

  return (
    <Form id={FORM_ID} form={form} onSubmit={submit}>
      <FormGrid cols={2}>
        <FormInput<ExpenseInput> name="date" type="date" label="Paid on" max={todayInputValue()} required />
        <FormSelect<ExpenseInput> name="category_id" label="Category" options={options} placeholder="Choose a category" valueAsNumber required />
        <FormInput<ExpenseInput> name="amount" type="number" label="Amount (₹)" min={0} step={0.01} required />
        <FormInput<ExpenseInput> name="paid_to" label="Paid to" placeholder="Shop, firm or person" required />
        <FormSelect<ExpenseInput> name="mode" label="Paid by" options={PAYMENT_MODE_OPTIONS} required />
        {mode !== 'cash' ? (
          <FormInput<ExpenseInput> name="reference" label={REFERENCE_LABELS[mode]} required />
        ) : (
          <FormInput<ExpenseInput> name="bill_no" label="Bill / invoice no." placeholder="From the supplier’s bill" />
        )}
        {mode !== 'cash' && (
          <>
            <FormInput<ExpenseInput> name="bank_name" label="Bank" placeholder="Paid from which account" />
            <FormInput<ExpenseInput> name="bill_no" label="Bill / invoice no." placeholder="From the supplier’s bill" />
          </>
        )}
        <FormFullRow>
          <FormTextarea<ExpenseInput> name="description" label="What was it for?" rows={2} placeholder="e.g. Diesel for bus UP32 AB 1234" />
        </FormFullRow>
      </FormGrid>
      {!expense && !canApprove && (
        <Alert tone="info">It goes to the principal for approval. It counts in today’s cash from now, since the money has been paid.</Alert>
      )}
    </Form>
  );
}
