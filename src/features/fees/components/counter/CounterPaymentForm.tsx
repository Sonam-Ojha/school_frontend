import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, Building2, CreditCard, Globe, Landmark, Printer, Smartphone, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { applyServerErrors } from '@/lib/formErrors';
import { cn } from '@/lib/cn';
import { formatCurrency, rupeesInWords, toDateInputValue, todayInputValue } from '@/lib/format';
import { percentageOf, subtractAmounts, sumAmounts } from '@/lib/money';

import { BANK_MODES, PAYMENT_MODE_LABELS, REFERENCE_LABELS } from '../../constants';
import { useCollectPayment } from '../../hooks/useCollection';
import { useDiscountOptions } from '../../hooks/useFeeCatalogue';
import { collectPaymentSchema, type CollectPaymentInput } from '../../schemas';
import type { Payment, PaymentMode, StudentDue, StudentFeeAccount } from '../../types';

const FIELDS = [
  'amount',
  'mode',
  'reference',
  'discount_id',
  'fine_amount',
  'paid_at',
  'remarks',
  'due_ids',
  'received_from',
  'bank_name',
  'instrument_date',
] as const;

const MODES: Array<{ mode: PaymentMode; icon: LucideIcon }> = [
  { mode: 'cash', icon: Banknote },
  { mode: 'upi', icon: Smartphone },
  { mode: 'cheque', icon: Landmark },
  { mode: 'card', icon: CreditCard },
  { mode: 'bank_transfer', icon: Building2 },
  { mode: 'online', icon: Globe },
];

interface CounterPaymentFormProps {
  account: StudentFeeAccount;
  /** The dues ticked on the account, oldest first. */
  dues: StudentDue[];
  onCollected: (payment: Payment) => void;
  canCollect: boolean;
}

function defaults(account: StudentFeeAccount, dues: StudentDue[]): CollectPaymentInput {
  return {
    student_id: account.student_id,
    amount: sumAmounts(dues.map((due) => due.balance)),
    mode: 'cash',
    reference: '',
    discount_id: null,
    fine_amount: 0,
    paid_at: todayInputValue(),
    remarks: '',
    due_ids: dues.map((due) => due.id),
    received_from: account.guardian_name ?? '',
    bank_name: '',
    instrument_date: '',
  };
}

/**
 * Taking the money. The amount follows what is ticked on the account, less a
 * concession, plus any extra fine; the cashier can take less for a part
 * payment. For cash it works out the change to hand back.
 */
export function CounterPaymentForm({ account, dues, onCollected, canCollect }: CounterPaymentFormProps) {
  const collect = useCollectPayment();
  const { discounts, discountOptions } = useDiscountOptions();
  const form = useForm<CollectPaymentInput>({
    resolver: zodResolver(collectPaymentSchema),
    defaultValues: defaults(account, dues),
  });
  const [tendered, setTendered] = useState('');

  const mode = form.watch('mode');
  const amount = form.watch('amount');
  const discountId = form.watch('discount_id');
  const fine = form.watch('fine_amount');

  const owed = useMemo(() => sumAmounts(dues.map((due) => due.balance)), [dues]);
  const discount = discounts.find((entry) => entry.id === discountId);
  const discountAmount = discount
    ? discount.value_type === 'percentage'
      ? percentageOf(owed, discount.value)
      : Math.min(discount.value, owed)
    : 0;
  const netDue = sumAmounts([subtractAmounts(owed, discountAmount), Number.isFinite(fine) ? fine : 0]);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const tenderedAmount = Number(tendered);
  const change = mode === 'cash' && tendered !== '' && Number.isFinite(tenderedAmount) ? subtractAmounts(tenderedAmount, safeAmount) : null;

  // What is owed changes as dues are ticked or a concession is chosen: the amount follows.
  const dueKey = dues.map((due) => due.id).join(',');
  useEffect(() => {
    form.setValue('due_ids', dues.map((due) => due.id));
    form.setValue('amount', netDue, { shouldValidate: form.formState.isSubmitted });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueKey, netDue]);

  // A new student starts a new form: their guardian, today's date, cash.
  useEffect(() => {
    form.reset(defaults(account, dues));
    setTendered('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.student_id]);

  const submit = (values: CollectPaymentInput) =>
    collect.mutate(values, {
      onSuccess: (payment) => {
        form.reset({ ...defaults(account, []), received_from: values.received_from });
        setTendered('');
        onCollected(payment);
      },
      onError: (error) => {
        if (!applyServerErrors(error, form.setError, FIELDS)) {
          form.setError('root.serverError', { type: 'server', message: error.message });
        }
      },
    });

  const nothingChosen = dues.length === 0;

  return (
    <Card className="lg:sticky lg:top-20">
      <CardBody>
        <Form form={form} onSubmit={submit} className="space-y-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Collect payment</p>
            <p className="mt-0.5 text-sm text-slate-600">
              {nothingChosen
                ? 'Tick the instalments or charges being paid.'
                : `${dues.length} item${dues.length === 1 ? '' : 's'} · ${formatCurrency(owed)} due`}
            </p>
          </div>

          {/* How the money came */}
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Paid by</legend>
            <div className="grid grid-cols-3 gap-1.5">
              {MODES.map(({ mode: option, icon: Icon }) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => form.setValue('mode', option, { shouldValidate: form.formState.isSubmitted })}
                  aria-pressed={mode === option}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                    mode === option
                      ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {PAYMENT_MODE_LABELS[option]}
                </button>
              ))}
            </div>
          </fieldset>

          <FormGrid cols={2}>
            <FormInput<CollectPaymentInput>
              name="amount"
              type="number"
              label="Amount received (₹)"
              min={0}
              step={0.01}
              required
              hint={safeAmount > 0 && safeAmount < netDue ? `Part payment — ${formatCurrency(subtractAmounts(netDue, safeAmount))} stays due` : undefined}
            />
            <FormInput<CollectPaymentInput> name="paid_at" type="date" label="Date" max={toDateInputValue(new Date())} required />

            {mode !== 'cash' && (
              <FormInput<CollectPaymentInput>
                name="reference"
                label={REFERENCE_LABELS[mode]}
                placeholder={mode === 'cheque' ? '000123' : mode === 'upi' ? 'e.g. 4321 8765 1234' : ''}
                required
              />
            )}
            {BANK_MODES.includes(mode) && (
              <>
                <FormInput<CollectPaymentInput> name="bank_name" label="Bank" placeholder="e.g. State Bank of India" />
                {mode === 'cheque' && <FormInput<CollectPaymentInput> name="instrument_date" type="date" label="Cheque date" />}
              </>
            )}
            {mode === 'card' && <FormInput<CollectPaymentInput> name="bank_name" label="Card / bank" placeholder="e.g. HDFC debit card" />}

            <FormSelect<CollectPaymentInput>
              name="discount_id"
              label="Concession"
              options={discountOptions}
              placeholder="None"
              valueAsNumber
              hint={discountAmount > 0 ? `−${formatCurrency(discountAmount)}` : undefined}
            />
            <FormInput<CollectPaymentInput>
              name="fine_amount"
              type="number"
              label="Extra fine (₹)"
              min={0}
              step={0.01}
              hint="Late fines are already in the dues."
            />
            <div className="sm:col-span-2">
              <FormInput<CollectPaymentInput> name="received_from" label="Received from" placeholder="Who handed over the money" />
            </div>
            <div className="sm:col-span-2">
              <FormInput<CollectPaymentInput> name="remarks" label="Remarks" placeholder="Optional" />
            </div>
          </FormGrid>

          {mode === 'cash' && (
            <div className="rounded-lg bg-slate-50 p-3">
              <label htmlFor="counter-tendered" className="text-sm font-medium text-slate-700">
                Cash handed over (₹)
              </label>
              <div className="mt-1 flex items-center gap-3">
                <Input
                  id="counter-tendered"
                  type="number"
                  min={0}
                  step={1}
                  value={tendered}
                  onChange={(event) => setTendered(event.target.value)}
                  placeholder="Optional"
                  className="w-36"
                />
                {change !== null && (
                  <p className={cn('text-sm font-semibold', change < 0 ? 'text-red-600' : 'text-emerald-700')}>
                    {change < 0 ? `${formatCurrency(-change)} short` : `Return ${formatCurrency(change)}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {safeAmount > netDue && netDue >= 0 && !nothingChosen && (
            <Alert tone="warning">That is more than the {formatCurrency(netDue)} due on what is ticked. Tick more, or take less.</Alert>
          )}

          <div className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-slate-600">To collect</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">{formatCurrency(safeAmount)}</span>
            </div>
            {safeAmount > 0 && <p className="mt-1 text-xs text-slate-500">{rupeesInWords(safeAmount)}</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={collect.isPending}
            disabled={!canCollect || nothingChosen || safeAmount <= 0}
            leftIcon={<Printer className="size-4" />}
          >
            Collect {formatCurrency(safeAmount)} & print receipt
          </Button>
          {!canCollect && <p className="text-center text-xs text-slate-500">You can see this account, but taking payments needs the “Fees: Create” permission.</p>}
        </Form>
      </CardBody>
    </Card>
  );
}
