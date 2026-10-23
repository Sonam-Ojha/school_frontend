import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { todayInputValue } from '@/lib/format';

import { platformApi, platformKeys } from '../api';
import type { PaymentMethod, PlatformInvoice, PlatformPlan, PlatformSchool } from '../types';
import { announce, Field, fieldError, moneyExact, PAYMENT_METHODS, SELECT_CLASS } from './shared';

/** Records money received against an invoice (UPI, bank transfer, cheque…). */
export function PaymentModal({ invoice, onClose }: { invoice: PlatformInvoice | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [reference, setReference] = useState('');
  const [paidOn, setPaidOn] = useState(todayInputValue());

  useEffect(() => {
    if (invoice) {
      setAmount(String(invoice.balance_due));
      setReference('');
      setPaidOn(todayInputValue());
    }
  }, [invoice]);

  const save = useMutation({
    mutationFn: () => platformApi.recordPayment(invoice!.id, { amount: Number(amount), method, reference, paid_on: paidOn }),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
      onClose();
    },
  });
  const error = (field: string) => fieldError(save.error, field);

  return (
    <Modal
      isOpen={invoice !== null}
      onClose={onClose}
      title={invoice ? `Record payment — ${invoice.number}` : 'Record payment'}
      description={invoice ? `${invoice.school?.name ?? ''} · balance due ${moneyExact(invoice.balance_due)}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} isLoading={save.isPending}>
            Record payment
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {save.error && !error('amount') && !error('method') && !error('paid_on') && (
          <Alert tone="danger" className="sm:col-span-2">
            {save.error.message}
          </Alert>
        )}
        <Field label="Amount received (₹)" required error={error('amount')}>
          <Input type="number" min={0} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </Field>
        <Field label="Received on" required error={error('paid_on')}>
          <Input type="date" value={paidOn} max={todayInputValue()} onChange={(event) => setPaidOn(event.target.value)} />
        </Field>
        <Field label="Method" required error={error('method')}>
          <select className={SELECT_CLASS} value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reference" error={error('reference')} hint="UTR, cheque number or UPI reference">
          <Input value={reference} onChange={(event) => setReference(event.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

/** Raises an invoice for a school by hand: a plan, a period, an optional price and discount. */
export function InvoiceModal({
  school,
  plans,
  onClose,
}: {
  school: PlatformSchool | null;
  plans: PlatformPlan[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [planId, setPlanId] = useState(0);
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [start, setStart] = useState(todayInputValue());
  const [amount, setAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [dueDays, setDueDays] = useState('7');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (school) {
      setPlanId(school.plan?.id ?? plans[0]?.id ?? 0);
      setCycle(school.billing_cycle);
      setStart(todayInputValue());
      setAmount('');
      setDiscount('');
      setNotes('');
    }
  }, [school, plans]);

  const plan = plans.find((entry) => entry.id === planId);
  const listPrice = plan ? (cycle === 'yearly' ? plan.price_yearly : plan.price_monthly) : 0;

  const save = useMutation({
    mutationFn: () =>
      platformApi.createInvoice(school!.id, {
        plan_id: planId,
        billing_cycle: cycle,
        period_start: start,
        amount: amount === '' ? null : Number(amount),
        discount: discount === '' ? null : Number(discount),
        due_days: dueDays === '' ? null : Number(dueDays),
        notes,
      }),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
      onClose();
    },
  });
  const error = (field: string) => fieldError(save.error, field);

  return (
    <Modal
      isOpen={school !== null}
      onClose={onClose}
      title="Raise an invoice"
      description={school ? `${school.name} · GST is added automatically (CGST + SGST or IGST by state)` : undefined}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} isLoading={save.isPending}>
            Raise invoice
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {save.error && Object.keys((save.error as { errors?: object }).errors ?? {}).length === 0 && (
          <Alert tone="danger" className="sm:col-span-2">
            {save.error.message}
          </Alert>
        )}
        <Field label="Plan" required error={error('plan_id')}>
          <select className={SELECT_CLASS} value={planId} onChange={(event) => setPlanId(Number(event.target.value))}>
            {plans.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Billing cycle" required error={error('billing_cycle')}>
          <select className={SELECT_CLASS} value={cycle} onChange={(event) => setCycle(event.target.value as 'monthly' | 'yearly')}>
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
        <Field label="Period starts" required error={error('period_start')}>
          <Input type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        </Field>
        <Field label="Days to pay" error={error('due_days')}>
          <Input type="number" min={0} max={120} value={dueDays} onChange={(event) => setDueDays(event.target.value)} />
        </Field>
        <Field label="Price before GST (₹)" error={error('amount')} hint={`Leave empty for the plan price, ₹${listPrice.toLocaleString('en-IN')}`}>
          <Input type="number" min={0} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={String(listPrice)} />
        </Field>
        <Field label="Discount (₹)" error={error('discount')}>
          <Input type="number" min={0} value={discount} onChange={(event) => setDiscount(event.target.value)} />
        </Field>
        <Field label="Notes" error={error('notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Printed on the invoice" />
        </Field>
      </div>
    </Modal>
  );
}
