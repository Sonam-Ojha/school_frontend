import { GraduationCap, Scissors } from 'lucide-react';

import type { SchoolSettings } from '@/features/settings/types';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate, formatDateTime, rupeesInWords } from '@/lib/format';

import { PAYMENT_MODE_LABELS, REFERENCE_LABELS } from '../constants';
import type { Payment } from '../types';

interface PaymentReceiptProps {
  payment: Payment;
  school: SchoolSettings | undefined;
  /**
   * Two copies on one A4 sheet — the parent's and the school's — with a line
   * to cut along, as a fee counter hands them out.
   */
  copies?: 1 | 2;
}

/**
 * Printable fee receipt, laid out the way Indian schools issue them: the
 * school's letterhead, the student with their father's name, what was paid
 * towards, the amount in words, how it was paid, and what is still due.
 *
 * Marked `print-exact` so the header survives printing — a receipt without
 * the school's identity is not a receipt. A cancelled receipt is watermarked
 * rather than hidden: somebody may still be holding the paper copy.
 */
export function PaymentReceipt({ payment, school, copies = 1 }: PaymentReceiptProps) {
  if (copies === 1) return <ReceiptCopy payment={payment} school={school} />;

  return (
    <div>
      <ReceiptCopy payment={payment} school={school} label="Parent’s copy" />
      <div className="relative my-5 border-t-2 border-dashed border-slate-300 print:my-4" aria-hidden>
        <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 bg-white px-2 text-[10px] text-slate-400">
          <Scissors className="size-3" /> cut here
        </span>
      </div>
      <ReceiptCopy payment={payment} school={school} label="School’s copy" />
    </div>
  );
}

function guardianLabel(relation: string | null | undefined): string {
  if (relation === 'father') return 'Father’s name';
  if (relation === 'mother') return 'Mother’s name';
  return 'Parent / guardian';
}

function Cell({ label, value, className }: { label: string; value: string | null | undefined; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <span className="text-[10px] tracking-wide text-slate-500 uppercase">{label}</span>
      <p className="truncate text-[13px] font-medium text-slate-900">{value || '—'}</p>
    </div>
  );
}

function ReceiptCopy({ payment, school, label }: { payment: Payment; school: SchoolSettings | undefined; label?: string }) {
  const address = school
    ? [school.address.line1, school.address.line2, school.address.city, school.address.state, school.address.postal_code]
        .filter(Boolean)
        .join(', ')
    : '';
  const contact = [school?.profile.phone, school?.profile.email, school?.profile.website].filter(Boolean).join(' · ');
  const isCheque = payment.mode === 'cheque';
  const paidBy = [
    PAYMENT_MODE_LABELS[payment.mode],
    payment.reference && payment.mode !== 'cash' ? `${REFERENCE_LABELS[payment.mode]}: ${payment.reference}` : null,
    payment.bank_name,
    payment.instrument_date ? `dated ${formatDate(payment.instrument_date)}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="print-exact relative mx-auto max-w-3xl break-inside-avoid border border-slate-300 bg-white p-5 text-slate-900">
      {payment.is_cancelled && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rotate-[-20deg] border-4 border-red-500 px-6 py-2 text-4xl font-black tracking-widest text-red-500 opacity-30">
            CANCELLED
          </span>
        </div>
      )}

      {/* Letterhead */}
      <header className="flex items-start gap-3 border-b-2 border-slate-800 pb-3">
        {school?.logo_url ? (
          <img src={school.logo_url} alt="" className="size-14 shrink-0 object-contain" />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white">
            <GraduationCap className="size-7" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-lg leading-tight font-bold tracking-tight uppercase">{school?.profile.name ?? 'School'}</p>
          {address && <p className="text-xs text-slate-600">{address}</p>}
          {contact && <p className="text-xs text-slate-600">{contact}</p>}
          {school?.profile.code && <p className="text-xs text-slate-600">School code: {school.profile.code}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="rounded border border-slate-800 px-2 py-0.5 text-xs font-bold tracking-wider uppercase">Fee receipt</p>
          {label && <p className="mt-1 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">{label}</p>}
        </div>
      </header>

      {/* Receipt and student */}
      <section className="grid grid-cols-3 gap-x-4 gap-y-2 border-b border-slate-200 py-3">
        <Cell label="Receipt no." value={payment.receipt_no} />
        <Cell label="Date" value={formatDate(payment.paid_at)} />
        <Cell label="Session" value={school?.current_academic_year?.name ?? null} />
        <Cell label="Student" value={payment.student_name} />
        <Cell label={guardianLabel(payment.guardian_relation)} value={payment.guardian_name ?? null} />
        <Cell label="Class" value={`${payment.class_name}${payment.section_name ? ` — ${payment.section_name}` : ''}`} />
        <Cell label="Admission no." value={payment.admission_no} />
        <Cell label="Roll no." value={payment.roll_no ?? null} />
        <Cell label="Received from" value={payment.received_from ?? null} />
      </section>

      {/* What it was paid towards */}
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-slate-300">
            <th scope="col" className="w-10 py-1.5 text-left text-[10px] tracking-wide text-slate-500 uppercase">
              S. no.
            </th>
            <th scope="col" className="py-1.5 text-left text-[10px] tracking-wide text-slate-500 uppercase">
              Particulars
            </th>
            <th scope="col" className="py-1.5 text-right text-[10px] tracking-wide text-slate-500 uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {payment.allocations.length === 0 ? (
            <tr className="border-b border-slate-100">
              <td className="py-1.5 text-slate-500">1</td>
              <td className="py-1.5 text-slate-700">Fee payment</td>
              <td className="py-1.5 text-right tabular-nums">{formatCurrency(payment.amount)}</td>
            </tr>
          ) : (
            payment.allocations.map((allocation, index) => (
              <tr key={`${allocation.due_id}-${index}`} className="border-b border-slate-100">
                <td className="py-1.5 text-slate-500">{index + 1}</td>
                <td className="py-1.5 text-slate-800">{allocation.installment_name}</td>
                <td className="py-1.5 text-right tabular-nums">{formatCurrency(allocation.amount)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          {payment.discount_amount > 0 && (
            <tr>
              <td />
              <td className="py-1 text-right text-xs text-slate-600">Concession</td>
              <td className="py-1 text-right text-xs tabular-nums text-emerald-700">−{formatCurrency(payment.discount_amount)}</td>
            </tr>
          )}
          {payment.fine_amount > 0 && (
            <tr>
              <td />
              <td className="py-1 text-right text-xs text-slate-600">Late fine</td>
              <td className="py-1 text-right text-xs tabular-nums text-amber-700">+{formatCurrency(payment.fine_amount)}</td>
            </tr>
          )}
          <tr className="border-t-2 border-slate-800">
            <td />
            <td className="py-1.5 text-right text-sm font-bold">Total received</td>
            <td className="py-1.5 text-right text-base font-bold tabular-nums">{formatCurrency(payment.amount)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-xs">
        <p>
          <span className="text-slate-500">In words: </span>
          <span className="font-semibold">{rupeesInWords(payment.amount)}</span>
        </p>
        <p>
          <span className="text-slate-500">Paid by: </span>
          {paidBy}
        </p>
        {typeof payment.balance_after === 'number' && (
          <p>
            <span className="text-slate-500">Balance due after this payment: </span>
            <span className="font-semibold">{formatCurrency(payment.balance_after)}</span>
          </p>
        )}
        {payment.remarks && (
          <p>
            <span className="text-slate-500">Remarks: </span>
            {payment.remarks}
          </p>
        )}
        {payment.is_cancelled && payment.cancelled_reason && (
          <p className="font-semibold text-red-700">Cancelled: {payment.cancelled_reason}</p>
        )}
      </div>

      <footer className="mt-5 flex items-end justify-between gap-4">
        <p className="text-[10px] leading-relaxed text-slate-500">
          Received by {payment.collected_by} · {formatDateTime(payment.collected_at ?? payment.paid_at)}
          <br />
          {isCheque && (
            <>
              Cheques are subject to realisation.
              <br />
            </>
          )}
          This is a computer-generated receipt. Please keep it safe.
        </p>
        <div className="shrink-0 text-center">
          <div className="h-9 w-36 border-b border-slate-500" />
          <p className="mt-1 text-[10px] text-slate-500">Cashier / Accountant</p>
        </div>
      </footer>
    </article>
  );
}
