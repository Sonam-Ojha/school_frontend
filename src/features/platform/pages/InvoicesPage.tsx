import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Download, Mail, Receipt } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import type { Column } from '@/components/table/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';

import { can, platformApi, platformKeys } from '../api';
import { PaymentModal } from '../components/BillingModals';
import { announce, announceError, InvoiceStatusBadge, moneyExact, SchoolLink, SELECT_CLASS, StatCard } from '../components/shared';
import { usePlatformAuth } from '../store';
import type { PlatformInvoice } from '../types';

const FILTERS = [
  { value: '', label: 'All invoices' },
  { value: 'open', label: 'Open' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
  { value: 'void', label: 'Void' },
];

/** `/superadmin/invoices`: every GST invoice, with outstanding dues, payments and reminders. */
export default function InvoicesPage() {
  const user = usePlatformAuth((state) => state.user);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [paying, setPaying] = useState<PlatformInvoice | null>(null);
  const [voiding, setVoiding] = useState<PlatformInvoice | null>(null);
  const manage = can(user, 'billing.manage');

  const params = status ? { status } : {};
  const invoices = useQuery({
    queryKey: platformKeys.invoices(params),
    queryFn: ({ signal }) => platformApi.invoices(params, signal),
    placeholderData: (previous) => previous,
  });
  const all = useQuery({ queryKey: platformKeys.invoices({}), queryFn: ({ signal }) => platformApi.invoices({}, signal) });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: platformKeys.all });
  const remind = useMutation({ mutationFn: (invoice: PlatformInvoice) => platformApi.remindInvoice(invoice.id), meta: { skipGlobalError: true }, onSuccess: (result) => { announce(result); refresh(); }, onError: announceError });
  const cancel = useMutation({
    mutationFn: (invoice: PlatformInvoice) => platformApi.voidInvoice(invoice.id),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      setVoiding(null);
      refresh();
    },
    onError: (error) => {
      setVoiding(null);
      announceError(error);
    },
  });

  const rows = all.data ?? [];
  const open = rows.filter((invoice) => invoice.status === 'open');
  const outstanding = open.reduce((total, invoice) => total + invoice.balance_due, 0);
  const overdue = open.filter((invoice) => invoice.overdue);
  const paidTotal = rows.filter((invoice) => invoice.status === 'paid').reduce((total, invoice) => total + invoice.total, 0);

  const columns: Column<PlatformInvoice>[] = [
    {
      key: 'number',
      header: 'Invoice',
      cell: (invoice) => (
        <div>
          <p className="font-medium text-slate-900">{invoice.number}</p>
          <p className="text-xs text-slate-500">
            Issued {formatDate(invoice.issued_at)} · {invoice.created_by === 'system' ? 'automatic' : `by ${invoice.created_by}`}
          </p>
        </div>
      ),
    },
    { key: 'school', header: 'School', cell: (invoice) => <SchoolLink school={invoice.school} /> },
    {
      key: 'plan',
      header: 'Plan & period',
      hideBelow: 'lg',
      cell: (invoice) => (
        <div className="text-xs text-slate-600">
          <p className="text-sm text-slate-700">
            {invoice.plan_name} · {invoice.billing_cycle}
          </p>
          {formatDate(invoice.period_start)} – {formatDate(invoice.period_end)}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total (incl. GST)',
      align: 'right',
      cell: (invoice) => (
        <div>
          <p className="font-medium text-slate-900">{moneyExact(invoice.total)}</p>
          <p className="text-xs text-slate-500">{invoice.igst > 0 ? `IGST ${moneyExact(invoice.igst)}` : `CGST+SGST ${moneyExact(invoice.cgst + invoice.sgst)}`}</p>
        </div>
      ),
    },
    {
      key: 'due',
      header: 'Due',
      hideBelow: 'md',
      cell: (invoice) => (
        <div>
          <p className="text-slate-700">{formatDate(invoice.due_date)}</p>
          {invoice.status === 'open' && invoice.balance_due < invoice.total && <p className="text-xs text-slate-500">{moneyExact(invoice.balance_due)} left</p>}
        </div>
      ),
    },
    { key: 'status', header: 'Status', cell: (invoice) => <InvoiceStatusBadge invoice={invoice} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '1%',
      cell: (invoice) => (
        <div className="flex justify-end gap-1 whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="sm" iconOnly aria-label="Download PDF" leftIcon={<Download className="size-4" />} onClick={() => void platformApi.downloadInvoice(invoice).catch(announceError)} />
          {manage && invoice.status === 'open' && (
            <>
              <Button variant="ghost" size="sm" iconOnly aria-label="Send reminder" leftIcon={<Mail className="size-4" />} onClick={() => remind.mutate(invoice)} />
              <Button variant="ghost" size="sm" iconOnly aria-label="Void invoice" leftIcon={<Ban className="size-4" />} onClick={() => setVoiding(invoice)} />
              <Button variant="outline" size="sm" onClick={() => setPaying(invoice)}>
                Record payment
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="GST-compliant invoices for every school. Renewal invoices are raised automatically ahead of each period, and reminders go out as they fall due." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding dues" value={moneyExact(outstanding)} hint={`${open.length} open invoice${open.length === 1 ? '' : 's'}`} tone="brand" />
        <StatCard label="Overdue" value={String(overdue.length)} hint={moneyExact(overdue.reduce((total, invoice) => total + invoice.balance_due, 0))} />
        <StatCard label="Paid to date" value={moneyExact(paidTotal)} hint={`${rows.filter((invoice) => invoice.status === 'paid').length} invoices`} />
      </div>

      <Card>
        <DataTable<PlatformInvoice>
          columns={columns}
          rows={invoices.data}
          isLoading={invoices.isPending}
          isFetching={invoices.isFetching}
          error={invoices.error}
          toolbar={
            <div className="flex gap-3 border-b border-slate-200 p-4">
              <select className={`${SELECT_CLASS} sm:w-56`} value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter invoices">
                {FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          }
          emptyState={<EmptyState icon={<Receipt className="size-6" />} title="No invoices here" description="Invoices appear as schools subscribe and renew." />}
        />
      </Card>

      <PaymentModal invoice={paying} onClose={() => setPaying(null)} />
      <ConfirmDialog
        isOpen={voiding !== null}
        onClose={() => setVoiding(null)}
        onConfirm={() => voiding && cancel.mutate(voiding)}
        title={`Void ${voiding?.number ?? 'invoice'}?`}
        message="A voided invoice stays in the series for the books but is no longer due. An invoice with payments against it cannot be voided."
        confirmLabel="Void invoice"
        isDestructive
        isLoading={cancel.isPending}
      />
    </div>
  );
}
