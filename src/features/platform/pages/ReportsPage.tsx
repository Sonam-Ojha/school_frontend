import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { useState } from 'react';

import { BarChart } from '@/components/charts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { saveBlob } from '@/lib/download';
import { formatDate } from '@/lib/format';

import { platformApi, platformKeys } from '../api';
import { methodLabel, money, moneyExact, SchoolLink, StatCard } from '../components/shared';
import type { RevenueReport } from '../types';

const monthsAgo = (count: number): string => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - count);
  return date.toISOString().slice(0, 7);
};

const csvCell = (value: string | number): string => {
  const text = String(value);
  // A cell starting with a formula character is quoted and defused, so a spreadsheet will not run it.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

function exportCsv(report: RevenueReport): void {
  const lines = [
    ['Month', 'Invoices', 'Invoiced (incl. GST)', 'Taxable value', 'GST', 'Collected'],
    ...report.months.map((row) => [row.label, row.invoices, row.invoiced, row.taxable, row.gst, row.collected]),
    [],
    ['School', 'Invoiced', 'Collected', 'Outstanding'],
    ...report.by_school.map((row) => [row.school.name, row.invoiced, row.collected, row.outstanding]),
    [],
    ['Date', 'School', 'Invoice', 'Method', 'Reference', 'Amount'],
    ...report.payments.map((payment) => [payment.paid_on, payment.school?.name ?? '', payment.invoice_number ?? '', methodLabel(payment.method), payment.reference, payment.amount]),
  ];
  const csv = '﻿' + lines.map((line) => line.map(csvCell).join(',')).join('\n');
  saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `revenue-${report.from}-to-${report.to}.csv`);
}

/** `/superadmin/reports`: platform revenue — invoiced, GST, collected and outstanding, by month, plan and school. */
export default function ReportsPage() {
  const [from, setFrom] = useState(monthsAgo(11));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 7));
  const params = { from, to };
  const report = useQuery({ queryKey: platformKeys.revenue(params), queryFn: ({ signal }) => platformApi.revenue(params, signal), placeholderData: (previous) => previous });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue reports"
        description="What was invoiced, the GST on it, what was collected and what is still owed."
        actions={
          report.data ? (
            <Button variant="outline" leftIcon={<Download className="size-4" />} onClick={() => exportCsv(report.data)}>
              Export to Excel (CSV)
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardBody className="flex flex-wrap items-end gap-4">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">From</span>
            <Input type="month" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">To</span>
            <Input type="month" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
        </CardBody>
      </Card>

      {report.isPending ? (
        <Skeleton className="h-96" />
      ) : report.isError ? (
        <Alert tone="danger">{report.error.message}</Alert>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard tone="brand" label="Collected" value={money(report.data.totals.collected)} />
            <StatCard label="Invoiced (incl. GST)" value={money(report.data.totals.invoiced)} hint={`Taxable ${money(report.data.totals.taxable)}`} />
            <StatCard label="GST invoiced" value={money(report.data.totals.gst)} />
            <StatCard label="Outstanding now" value={money(report.data.totals.outstanding)} />
          </div>

          <Card>
            <CardHeader title="Invoiced and collected, by month" />
            <CardBody>
              <BarChart
                series={[
                  { label: 'Invoiced', data: report.data.months.map((row) => ({ label: row.label, value: row.invoiced })) },
                  { label: 'Collected', data: report.data.months.map((row) => ({ label: row.label, value: row.collected })) },
                ]}
                format={money}
                axisFormat={(value) => (value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${value}`)}
                height={260}
              />
            </CardBody>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader title="By plan" />
              <CardBody className="p-0">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-3">Plan</th>
                      <th className="px-6 py-3 text-right">Invoiced</th>
                      <th className="px-6 py-3 text-right">Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.data.by_plan.map((row) => (
                      <tr key={row.plan}>
                        <td className="px-6 py-3 text-slate-900">{row.plan}</td>
                        <td className="px-6 py-3 text-right">{moneyExact(row.invoiced)}</td>
                        <td className="px-6 py-3 text-right font-medium">{moneyExact(row.collected)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="By school" />
              <CardBody className="p-0">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-3">School</th>
                      <th className="px-6 py-3 text-right">Collected</th>
                      <th className="px-6 py-3 text-right">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.data.by_school.map((row) => (
                      <tr key={row.school.id}>
                        <td className="px-6 py-3">
                          <SchoolLink school={row.school} />
                        </td>
                        <td className="px-6 py-3 text-right font-medium">{moneyExact(row.collected)}</td>
                        <td className={`px-6 py-3 text-right ${row.outstanding > 0 ? 'text-amber-700' : 'text-slate-500'}`}>{moneyExact(row.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title="Payments in this period" />
            <CardBody className="p-0">
              <table className="min-w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {report.data.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-3 text-slate-500">{formatDate(payment.paid_on)}</td>
                      <td className="px-6 py-3">
                        <SchoolLink school={payment.school} />
                      </td>
                      <td className="px-6 py-3 text-slate-600">{payment.invoice_number}</td>
                      <td className="px-6 py-3 text-slate-600">{methodLabel(payment.method)}</td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">{moneyExact(payment.amount)}</td>
                    </tr>
                  ))}
                  {report.data.payments.length === 0 && (
                    <tr>
                      <td className="px-6 py-6 text-center text-slate-500">No payments in this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
