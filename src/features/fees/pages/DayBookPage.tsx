import { ChevronLeft, ChevronRight, FileDown, FileSpreadsheet, Lock, Printer, Scale } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate, formatDateTime, todayInputValue } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { FEE_PERMISSIONS, NOTE_VALUES } from '../constants';
import { useCloseDay, useDayBook, useExportDayBook } from '../hooks/useCollection';
import type { DayBook } from '../types';

const timeFormatter = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' });
const timeOf = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || /^\d{4}-\d{2}-\d{2}$/.test(value) ? '—' : timeFormatter.format(date);
};

function shiftDay(date: string, by: number): string {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + by);
  const offset = next.getTimezoneOffset() * 60_000;
  return new Date(next.getTime() - offset).toISOString().slice(0, 10);
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'good' | 'bad' | 'warn' }) {
  return (
    <div className="rounded-card border border-slate-200 bg-white px-4 py-3 shadow-card print:shadow-none">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={cn(
          'mt-0.5 text-lg font-semibold tabular-nums',
          tone === 'good' ? 'text-emerald-700' : tone === 'bad' ? 'text-red-600' : tone === 'warn' ? 'text-amber-700' : 'text-slate-900',
        )}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** Counting the drawer at the end of the day, note by note, against what the day book says. */
function CashTally({ book, collector }: { book: DayBook; collector: string | null }) {
  const closeDay = useCloseDay();
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [coins, setCoins] = useState('');
  const [remarks, setRemarks] = useState('');

  // A day already closed opens with what was counted, ready to count again.
  const closeId = book.close?.closed_at ?? '';
  useEffect(() => {
    const close = book.close;
    setCounts(close ? Object.fromEntries(Object.entries(close.denominations).map(([face, count]) => [face, String(count)])) : {});
    setCoins(close && close.coins ? String(close.coins) : '');
    setRemarks(close?.remarks ?? '');
  }, [closeId, book.date, collector, book.close]);

  const counted = useMemo(
    () => NOTE_VALUES.reduce((total, face) => total + face * (Number(counts[face]) || 0), 0) + (Number(coins) || 0),
    [counts, coins],
  );
  const difference = Math.round((counted - book.cash.expected) * 100) / 100;

  const submit = () =>
    closeDay.mutate({
      date: book.date,
      collector,
      denominations: Object.fromEntries(
        NOTE_VALUES.map((face) => [String(face), Number(counts[face]) || 0]).filter(([, count]) => (count as number) > 0),
      ),
      coins: Number(coins) || 0,
      remarks,
    });

  return (
    <Card>
      <CardHeader
        title="Cash in hand"
        description={`Count the drawer and hand it over. Expected: cash received ${formatCurrency(book.cash.received)} − cash paid out ${formatCurrency(book.cash.paid_out)}.`}
      />
      <CardBody className="space-y-4">
        {book.close && (
          <Alert tone={book.close.difference === 0 ? 'success' : 'warning'} title={`Closed by ${book.close.closed_by}, ${formatDateTime(book.close.closed_at)}`}>
            Counted {formatCurrency(book.close.counted_cash)} against {formatCurrency(book.close.expected_cash)} expected
            {book.close.difference === 0
              ? ' — it tallied.'
              : book.close.difference > 0
                ? ` — ${formatCurrency(book.close.difference)} extra.`
                : ` — ${formatCurrency(-book.close.difference)} short.`}
            {book.close.remarks ? ` ${book.close.remarks}` : ''}
          </Alert>
        )}

        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th scope="col" className="py-1 text-left font-medium">Note</th>
              <th scope="col" className="py-1 text-left font-medium">Count</th>
              <th scope="col" className="py-1 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {NOTE_VALUES.map((face) => (
              <tr key={face}>
                <td className="py-1.5 font-medium text-slate-700">₹{face} ×</td>
                <td className="py-1.5">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={counts[face] ?? ''}
                    onChange={(event) => setCounts((current) => ({ ...current, [face]: event.target.value }))}
                    className="h-8 w-24"
                    aria-label={`Number of ₹${face} notes`}
                  />
                </td>
                <td className="py-1.5 text-right tabular-nums">{formatCurrency(face * (Number(counts[face]) || 0))}</td>
              </tr>
            ))}
            <tr>
              <td className="py-1.5 font-medium text-slate-700">Coins</td>
              <td className="py-1.5">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={coins}
                  onChange={(event) => setCoins(event.target.value)}
                  className="h-8 w-24"
                  placeholder="₹"
                  aria-label="Coins, as an amount"
                />
              </td>
              <td className="py-1.5 text-right tabular-nums">{formatCurrency(Number(coins) || 0)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-800">
              <td colSpan={2} className="py-2 font-semibold">Counted</td>
              <td className="py-2 text-right text-base font-bold tabular-nums">{formatCurrency(counted)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="py-1 text-slate-600">Expected from the day book</td>
              <td className="py-1 text-right tabular-nums">{formatCurrency(book.cash.expected)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="py-1 font-medium">Difference</td>
              <td
                className={cn(
                  'py-1 text-right font-semibold tabular-nums',
                  difference === 0 ? 'text-emerald-700' : difference < 0 ? 'text-red-600' : 'text-amber-700',
                )}
              >
                {difference === 0 ? 'Tallies' : difference < 0 ? `${formatCurrency(-difference)} short` : `${formatCurrency(difference)} extra`}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="print-hidden space-y-3">
          <Textarea rows={2} value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Remarks — e.g. handed to the principal; ₹20 short explained by…" maxLength={300} />
          <Can permissions={[FEE_PERMISSIONS.create]}>
            <Button fullWidth leftIcon={<Lock className="size-4" />} isLoading={closeDay.isPending} onClick={submit}>
              {book.close ? 'Count again and close' : 'Close the day and hand over'}
            </Button>
          </Can>
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * The day book of the fee counter: every receipt of a day (and those
 * cancelled), the money by mode, the expenses paid out, and the cash that
 * should be in the drawer — counted and handed over at closing time. For one
 * cashier or the whole school; printed with signature lines for the handover.
 */
export default function DayBookPage() {
  const user = useAuthStore((state) => state.user);
  const { data: school } = useSettings();
  const [date, setDate] = useState(todayInputValue());
  const [collector, setCollector] = useState<string>('');
  const { data: book, isLoading, isFetching, error } = useDayBook(date, collector || null);
  const exportBook = useExportDayBook();
  const today = todayInputValue();

  const collectorOptions = useMemo(() => {
    const names = new Set((book?.collectors ?? []).map((entry) => entry.name));
    if (user?.name) names.add(user.name);
    return [{ label: 'All counters', value: '' }, ...[...names].sort().map((name) => ({ label: name, value: name }))];
  }, [book?.collectors, user?.name]);

  return (
    <div className="print-target space-y-4">
      {/* On paper: whose day book, and for when. */}
      <div className="hidden border-b-2 border-slate-800 pb-2 print:block">
        <p className="text-lg font-bold uppercase">{school?.profile.name}</p>
        <p className="text-sm">
          Day book — {formatDate(date)} — {collector || 'all counters'}
        </p>
      </div>

      <div className="print-hidden flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" iconOnly aria-label="Previous day" leftIcon={<ChevronLeft className="size-4" />} onClick={() => setDate((current) => shiftDay(current, -1))} />
          <Input type="date" value={date} max={today} onChange={(event) => event.target.value && setDate(event.target.value)} className="h-9 w-40" aria-label="Day" />
          <Button
            variant="outline"
            size="sm"
            iconOnly
            aria-label="Next day"
            disabled={date >= today}
            leftIcon={<ChevronRight className="size-4" />}
            onClick={() => setDate((current) => shiftDay(current, 1))}
          />
          {date !== today && (
            <Button variant="ghost" size="sm" onClick={() => setDate(today)}>
              Today
            </Button>
          )}
          <Select options={collectorOptions} value={collector} onChange={(event) => setCollector(event.target.value)} className="h-9 w-52" aria-label="Counter" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Can permissions={[FEE_PERMISSIONS.export]}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="size-4" />}
              isLoading={exportBook.isPending && exportBook.variables?.format === 'excel'}
              onClick={() => exportBook.mutate({ date, collector: collector || null, format: 'excel' })}
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileDown className="size-4" />}
              isLoading={exportBook.isPending && exportBook.variables?.format === 'pdf'}
              onClick={() => exportBook.mutate({ date, collector: collector || null, format: 'pdf' })}
            >
              PDF
            </Button>
          </Can>
          <Button size="sm" leftIcon={<Printer className="size-4" />} onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      {error ? (
        <Alert tone="danger" title="Could not load the day book">
          {error.message}
        </Alert>
      ) : isLoading || !book ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className={cn('space-y-4 transition-opacity', isFetching && 'opacity-70')}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Collected" value={formatCurrency(book.totals.amount)} hint={`${book.totals.receipts} receipt${book.totals.receipts === 1 ? '' : 's'}`} />
            <Stat
              label="Cash received"
              value={formatCurrency(book.cash.received)}
              hint={book.by_mode
                .filter((entry) => entry.mode !== 'cash' && entry.amount > 0)
                .map((entry) => `${entry.label} ${formatCurrency(entry.amount)}`)
                .join(' · ') || 'No other modes'}
            />
            <Stat label="Expenses paid" value={formatCurrency(book.expenses.amount)} hint={`${formatCurrency(book.expenses.cash)} of it in cash`} tone={book.expenses.amount > 0 ? 'warn' : undefined} />
            <Stat
              label="Cash expected in hand"
              value={formatCurrency(book.cash.expected)}
              hint={book.close ? (book.close.difference === 0 ? 'Counted and tallied' : 'Counted — see below') : 'Not counted yet'}
              tone={book.close ? (book.close.difference === 0 ? 'good' : 'bad') : undefined}
            />
          </div>

          {book.collectors.length > 1 && !collector && (
            <Card>
              <CardHeader title="By counter" />
              <ul className="divide-y divide-slate-100">
                {book.collectors.map((entry) => (
                  <li key={entry.name} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm sm:px-6">
                    <button type="button" className="font-medium text-brand-700 hover:underline print:text-slate-900" onClick={() => setCollector(entry.name)}>
                      {entry.name}
                    </button>
                    <span className="text-slate-600 tabular-nums">
                      {entry.receipts} receipts · {formatCurrency(entry.amount)} · cash {formatCurrency(entry.cash)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <Card>
                <CardHeader title="Receipts" description={book.totals.receipts === 0 ? 'Nothing was collected on this day.' : undefined} />
                {book.receipts.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left font-medium">Time</th>
                          <th scope="col" className="px-2 py-2 text-left font-medium">Receipt</th>
                          <th scope="col" className="px-2 py-2 text-left font-medium">Student</th>
                          <th scope="col" className="hidden px-2 py-2 text-left font-medium md:table-cell">Towards</th>
                          <th scope="col" className="px-2 py-2 text-left font-medium">Mode</th>
                          <th scope="col" className="px-4 py-2 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {book.receipts.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-slate-600">{timeOf(row.time)}</td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <Link to={toPath(PATHS.feeReceipt, { id: row.id })} className="font-medium text-brand-700 hover:underline print:text-slate-900">
                                {row.receipt_no}
                              </Link>
                            </td>
                            <td className="px-2 py-2">
                              <span className="font-medium text-slate-900">{row.student_name}</span>
                              <span className="block text-xs text-slate-500">
                                {row.class_name}
                                {row.section_name ? ` — ${row.section_name}` : ''} · {row.admission_no}
                              </span>
                            </td>
                            <td className="hidden max-w-56 truncate px-2 py-2 text-slate-600 md:table-cell" title={row.towards}>
                              {row.towards || '—'}
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              {row.mode_label}
                              {row.reference && row.mode !== 'cash' && <span className="block text-xs text-slate-500">{row.reference}</span>}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold tabular-nums">{formatCurrency(row.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-800">
                          <td colSpan={5} className="px-4 py-2 font-semibold">Total</td>
                          <td className="px-4 py-2 text-right font-bold tabular-nums">{formatCurrency(book.totals.amount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </Card>

              {book.cancelled.length > 0 && (
                <Card>
                  <CardHeader title="Cancelled receipts" description="Not counted in the totals." />
                  <ul className="divide-y divide-slate-100">
                    {book.cancelled.map((row) => (
                      <li key={row.id} className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm sm:px-6">
                        <div>
                          <span className="font-medium text-slate-500 line-through">{row.receipt_no}</span>
                          <span className="ml-2 text-slate-600">{row.student_name}</span>
                          {row.cancelled_reason && <span className="block text-xs text-red-700">{row.cancelled_reason}</span>}
                        </div>
                        <span className="text-slate-500 tabular-nums line-through">{formatCurrency(row.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card>
                <CardHeader
                  title="Expenses paid"
                  description={book.expenses.count === 0 ? 'No expenses were recorded for this day.' : undefined}
                  actions={
                    <Can permissions={['expenses.read']}>
                      <Link to={PATHS.expenses} className="print-hidden text-sm font-medium text-brand-700 hover:underline">
                        Expense book
                      </Link>
                    </Can>
                  }
                />
                {book.expenses.items.length > 0 && (
                  <ul className="divide-y divide-slate-100">
                    {book.expenses.items.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm sm:px-6">
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900">{item.paid_to}</span>
                          <span className="ml-2 text-xs text-slate-500">
                            {item.voucher_no} · {item.category_name} · {item.mode_label}
                          </span>
                          {item.status === 'pending' && (
                            <Badge tone="warning" className="ml-2">
                              Awaiting approval
                            </Badge>
                          )}
                          {item.description && <span className="block truncate text-xs text-slate-500">{item.description}</span>}
                        </div>
                        <span className="shrink-0 font-semibold tabular-nums">{formatCurrency(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="space-y-4">
              <CashTally book={book} collector={collector || null} />
              <div className="hidden grid-cols-3 gap-6 pt-10 text-center text-xs print:grid">
                {['Cashier', 'Accountant', 'Principal'].map((role) => (
                  <div key={role}>
                    <div className="h-8 border-b border-slate-500" />
                    <p className="mt-1">{role}</p>
                  </div>
                ))}
              </div>
              <p className="print-hidden flex items-start gap-2 text-xs text-slate-500">
                <Scale className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                Receipts count on the date written on them. Cheques, UPI and card payments go to the bank, so only cash is counted here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
