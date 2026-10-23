import { useQuery } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import type { Column } from '@/components/table/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';

import { platformApi, platformKeys } from '../api';
import { methodLabel, moneyExact, SchoolLink, StatCard } from '../components/shared';
import type { PlatformPayment } from '../types';

/** `/superadmin/payments`: every payment received, online or recorded by hand. */
export default function PaymentsPage() {
  const payments = useQuery({ queryKey: platformKeys.payments(), queryFn: ({ signal }) => platformApi.payments(signal) });
  const rows = payments.data ?? [];
  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = rows.filter((payment) => payment.paid_on.startsWith(month));

  const columns: Column<PlatformPayment>[] = [
    { key: 'paid_on', header: 'Received', cell: (payment) => formatDate(payment.paid_on) },
    { key: 'school', header: 'School', cell: (payment) => <SchoolLink school={payment.school} /> },
    { key: 'invoice', header: 'Invoice', hideBelow: 'sm', cell: (payment) => payment.invoice_number ?? '—' },
    { key: 'method', header: 'Method', hideBelow: 'md', cell: (payment) => methodLabel(payment.method) },
    { key: 'reference', header: 'Reference', hideBelow: 'lg', cell: (payment) => <span className="text-xs text-slate-500">{payment.reference || '—'}</span> },
    { key: 'amount', header: 'Amount', align: 'right', cell: (payment) => <span className="font-medium text-slate-900">{moneyExact(payment.amount)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Payment history across every school: Razorpay payments arrive by themselves; bank, UPI and cheque payments are recorded against their invoice." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard tone="brand" label="Received this month" value={moneyExact(thisMonth.reduce((total, payment) => total + payment.amount, 0))} hint={`${thisMonth.length} payment${thisMonth.length === 1 ? '' : 's'}`} />
        <StatCard label="Received in total" value={moneyExact(rows.reduce((total, payment) => total + payment.amount, 0))} hint={`${rows.length} payments`} />
        <StatCard label="Paid online" value={moneyExact(rows.filter((payment) => payment.method === 'razorpay').reduce((total, payment) => total + payment.amount, 0))} hint="Through Razorpay" />
      </div>
      <Card>
        <DataTable<PlatformPayment>
          columns={columns}
          rows={payments.data}
          isLoading={payments.isPending}
          error={payments.error}
          emptyState={<EmptyState icon={<Wallet className="size-6" />} title="No payments yet" />}
        />
      </Card>
    </div>
  );
}
