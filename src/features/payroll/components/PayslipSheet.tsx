import { Avatar } from '@/components/ui/Avatar';
import type { SchoolSettings } from '@/features/settings/types';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';

import { EMPLOYEE_TYPE_LABELS } from '../constants';
import type { Payslip } from '../types';

interface PayslipSheetProps {
  payslip: Payslip;
  school?: SchoolSettings;
}

/** `2026-08` → `August 2026`. */
function monthLabel(month: string): string {
  const [year, index] = month.split('-').map(Number);
  return new Date(Date.UTC(year, index - 1, 1)).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function Row({ label, amount, isTotal }: { label: string; amount: number; isTotal?: boolean }) {
  return (
    <div
      className={cn(
        'flex justify-between gap-4 py-1',
        isTotal && 'mt-1 border-t border-slate-300 pt-1.5 font-semibold',
      )}
    >
      <span className={cn('text-xs', isTotal ? 'text-slate-900' : 'text-slate-600')}>{label}</span>
      <span className="font-mono text-xs text-slate-900 tabular-nums">
        {formatCurrency(amount)}
      </span>
    </div>
  );
}

/**
 * A payslip, sized for A4.
 *
 * Earnings and deductions side by side because that is how everybody who has
 * ever been handed one reads it — the eye goes to the two columns and then to
 * the net at the bottom. The employer's PF and ESI shares are shown but kept
 * out of the deduction column: they are the school's cost, not the
 * employee's, and adding them there is how a payslip ends up understating
 * what somebody was actually paid.
 */
export function PayslipSheet({ payslip, school }: PayslipSheetProps) {
  return (
    <article className="print-exact mx-auto max-w-3xl bg-white p-6 text-slate-900">
      <header className="flex items-start justify-between gap-4 border-b border-slate-300 pb-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold">{school?.profile.name ?? 'School'}</h1>
          {school?.address && (
            <p className="truncate text-xs text-slate-500">
              {[school.address.line1, school.address.city, school.address.state]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs tracking-wide text-slate-500 uppercase">Payslip</p>
          <p className="text-sm font-semibold">{monthLabel(payslip.month)}</p>
        </div>
      </header>

      <section className="flex items-start gap-4 border-b border-slate-200 py-4">
        <Avatar name={payslip.employee_name} src={payslip.photo_url} size="lg" />

        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
          {[
            ['Name', payslip.employee_name],
            ['Employee ID', payslip.employee_code],
            ['Designation', payslip.designation],
            ['Category', EMPLOYEE_TYPE_LABELS[payslip.employee_type]],
            ['Department', payslip.department ?? '—'],
            ['PAN', payslip.pan ?? '—'],
            ['UAN', payslip.uan ?? '—'],
            ['ESI number', payslip.esi_number ?? '—'],
            ['Bank account', payslip.bank_account ?? '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-slate-500">{label}</dt>
              <dd className="truncate font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid grid-cols-3 gap-4 border-b border-slate-200 py-3 text-xs">
        <div>
          <p className="text-slate-500">Working days</p>
          <p className="font-semibold">{payslip.working_days}</p>
        </div>
        <div>
          <p className="text-slate-500">Paid days</p>
          <p className="font-semibold">{payslip.paid_days}</p>
        </div>
        <div>
          <p className="text-slate-500">Loss of pay</p>
          <p className={cn('font-semibold', payslip.lop_days > 0 && 'text-red-700')}>
            {payslip.lop_days}
          </p>
        </div>
      </section>

      <section className="grid gap-6 py-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-semibold tracking-wide text-slate-700 uppercase">
            Earnings
          </h2>
          <Row label="Basic" amount={payslip.basic} />
          {payslip.earnings.map((line) => (
            <Row key={line.code} label={line.name} amount={line.amount} />
          ))}
          <Row label="Gross" amount={payslip.gross} isTotal />
        </div>

        <div>
          <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-semibold tracking-wide text-slate-700 uppercase">
            Deductions
          </h2>
          {payslip.deductions.length === 0 ? (
            <p className="py-1 text-xs text-slate-400">None</p>
          ) : (
            payslip.deductions.map((line) => (
              <Row key={line.code} label={line.name} amount={line.amount} />
            ))
          )}
          <Row label="Total deductions" amount={payslip.total_deductions} isTotal />
        </div>
      </section>

      <section className="flex items-baseline justify-between border-y-2 border-slate-800 py-3">
        <span className="text-sm font-semibold tracking-wide uppercase">Net pay</span>
        <span className="font-mono text-lg font-bold tabular-nums">
          {formatCurrency(payslip.net)}
        </span>
      </section>

      {(payslip.pf_employer > 0 || payslip.esi_employer > 0) && (
        <section className="pt-3">
          <h2 className="mb-1.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            Employer contributions — not deducted from your pay
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 text-[11px] sm:grid-cols-4">
            {[
              ['PF wages', payslip.pf_wages],
              ['Employer PF', payslip.pf_employer - payslip.eps_employer],
              ['Pension (EPS)', payslip.eps_employer],
              ['Employer ESI', payslip.esi_employer],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between gap-2">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-mono tabular-nums">{formatCurrency(value as number)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <footer className="mt-4 border-t border-slate-200 pt-3 text-[10px] text-slate-400">
        Computer generated — no signature required. Figures are frozen as at
        processing and do not change if a salary is revised afterwards.
      </footer>
    </article>
  );
}
