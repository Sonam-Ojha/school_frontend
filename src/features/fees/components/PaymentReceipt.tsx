import { GraduationCap } from 'lucide-react';

import type { SchoolSettings } from '@/features/settings/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';

import { PAYMENT_MODE_LABELS } from '../constants';
import type { Payment } from '../types';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="truncate text-sm font-medium text-slate-900">{value || '—'}</p>
    </div>
  );
}

/**
 * Printable fee receipt.
 *
 * Laid out for A5 and marked `print-exact` so the header block survives
 * printing — a receipt without the school identity is not a receipt. The
 * cancelled state is watermarked rather than hidden: a voided receipt still
 * exists and someone may be holding the paper copy.
 */
export function PaymentReceipt({
  payment,
  school,
}: {
  payment: Payment;
  school: SchoolSettings | undefined;
}) {
  return (
    <div className="print-exact relative mx-auto max-w-2xl bg-white p-6">
      {payment.is_cancelled && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rotate-[-20deg] border-4 border-red-500 px-6 py-2 text-4xl font-black tracking-widest text-red-500 opacity-30">
            CANCELLED
          </span>
        </div>
      )}

      <header className="flex items-start gap-3 border-b-2 border-slate-800 pb-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white">
          {school?.logo_url ? (
            <img src={school.logo_url} alt="" className="size-8 object-contain" />
          ) : (
            <GraduationCap className="size-6" aria-hidden />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-slate-900">
            {school?.profile.name ?? 'School'}
          </p>
          <p className="truncate text-xs text-slate-600">
            {school
              ? `${school.address.line1}, ${school.address.city} ${school.address.postal_code}`
              : ''}
          </p>
          <p className="truncate text-xs text-slate-600">
            {school?.profile.phone}
            {school?.profile.email ? ` · ${school.profile.email}` : ''}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] tracking-wide text-slate-500 uppercase">Fee receipt</p>
          <p className="font-mono text-sm font-bold text-slate-900">{payment.receipt_no}</p>
          <p className="text-xs text-slate-600">{formatDate(payment.paid_at)}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 border-b border-slate-200 py-3 sm:grid-cols-4">
        <Field label="Student" value={payment.student_name} />
        <Field label="Admission no." value={payment.admission_no} />
        <Field
          label="Class"
          value={`${payment.class_name}${payment.section_name ? ` — ${payment.section_name}` : ''}`}
        />
        <Field label="Mode" value={PAYMENT_MODE_LABELS[payment.mode]} />
      </section>

      <table className="w-full border-collapse py-3 text-sm">
        <thead>
          <tr className="border-b border-slate-300">
            <th scope="col" className="py-2 text-left text-[10px] tracking-wide text-slate-500 uppercase">
              Instalment
            </th>
            <th scope="col" className="py-2 text-right text-[10px] tracking-wide text-slate-500 uppercase">
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          {payment.allocations.map((allocation) => (
            <tr key={allocation.due_id} className="border-b border-slate-100">
              <td className="py-1.5 text-slate-800">{allocation.installment_name}</td>
              <td className="py-1.5 text-right text-slate-900">
                {formatCurrency(allocation.amount)}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          {payment.discount_amount > 0 && (
            <tr>
              <td className="py-1 text-right text-xs text-slate-600">Discount</td>
              <td className="py-1 text-right text-xs text-emerald-700">
                −{formatCurrency(payment.discount_amount)}
              </td>
            </tr>
          )}
          {payment.fine_amount > 0 && (
            <tr>
              <td className="py-1 text-right text-xs text-slate-600">Fine</td>
              <td className="py-1 text-right text-xs text-amber-700">
                +{formatCurrency(payment.fine_amount)}
              </td>
            </tr>
          )}
          <tr className="border-t-2 border-slate-800">
            <td className="py-2 text-right text-sm font-bold text-slate-900">Total received</td>
            <td className="py-2 text-right text-base font-bold text-slate-900">
              {formatCurrency(payment.amount)}
            </td>
          </tr>
        </tfoot>
      </table>

      {payment.reference && (
        <p className="text-xs text-slate-600">
          Reference: <span className="font-medium">{payment.reference}</span>
        </p>
      )}
      {payment.remarks && <p className="mt-1 text-xs text-slate-600">{payment.remarks}</p>}

      {payment.is_cancelled && payment.cancelled_reason && (
        <p className="mt-2 text-xs font-semibold text-red-700">
          Cancelled: {payment.cancelled_reason}
        </p>
      )}

      <footer className="mt-6 flex items-end justify-between border-t border-slate-200 pt-3">
        <p className="text-[10px] text-slate-500">
          Collected by {payment.collected_by} · {formatDateTime(payment.paid_at)}
          <br />
          This is a computer-generated receipt.
        </p>

        <div className="text-center">
          <div className="h-8 w-32 border-b border-slate-400" />
          <p className="mt-1 text-[10px] text-slate-500">Authorised signatory</p>
        </div>
      </footer>
    </div>
  );
}
