import { MessageCircle, Phone, Plus, Printer, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate, whatsAppLink } from '@/lib/format';

import { DUE_STATUS_LABELS, DUE_STATUS_TONES, FEE_PERMISSIONS, PAYMENT_MODE_LABELS } from '../../constants';
import { usePayments } from '../../hooks/useCollection';
import type { StudentDue, StudentFeeAccount } from '../../types';

interface CounterAccountProps {
  account: StudentFeeAccount;
  selected: number[];
  onToggle: (dueId: number) => void;
  onSelectOutstanding: () => void;
  onClearSelection: () => void;
  onAddCharge: () => void;
  onRemoveCharge: (due: StudentDue) => void;
  removingId: number | null;
  schoolName: string;
}

function guardianWord(relation: string | null | undefined): string {
  if (relation === 'father') return 'Father';
  if (relation === 'mother') return 'Mother';
  return 'Guardian';
}

/** The student at the counter: who they are, what they owe, and what is being paid now. */
export function CounterAccount({
  account,
  selected,
  onToggle,
  onSelectOutstanding,
  onClearSelection,
  onAddCharge,
  onRemoveCharge,
  removingId,
  schoolName,
}: CounterAccountProps) {
  const dues = [...account.dues].sort((a, b) => a.due_date.localeCompare(b.due_date) || a.sequence - b.sequence);
  const outstanding = dues.filter((due) => due.balance > 0);
  const overdue = outstanding.filter((due) => due.days_overdue > 0);
  const recent = usePayments({ student_id: account.student_id, per_page: 4, sort_by: 'paid_at', sort_dir: 'desc' });
  const classLabel = `${account.class_name}${account.section_name ? ` — ${account.section_name}` : ''}`;

  const reminder = whatsAppLink(
    account.guardian_phone,
    [
      'Dear Parent,',
      `This is a reminder that fees of ${formatCurrency(account.balance)} are due for ${account.student_name} (${classLabel}).`,
      overdue.length > 0 ? `${overdue.map((due) => due.installment_name).join(', ')} ${overdue.length === 1 ? 'is' : 'are'} overdue.` : '',
      'Please pay at the school office or online at your earliest convenience.',
      `— ${schoolName}`,
    ]
      .filter(Boolean)
      .join('\n'),
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={account.student_name} src={account.photo_url} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">{account.student_name}</h2>
            <p className="text-sm text-slate-600">
              {classLabel} · Adm. no. <code className="text-slate-800">{account.admission_no}</code>
              {account.roll_no ? ` · Roll no. ${account.roll_no}` : ''}
            </p>
            {account.guardian_name && (
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                <span>
                  {guardianWord(account.guardian_relation)}: <span className="font-medium text-slate-800">{account.guardian_name}</span>
                </span>
                {account.guardian_phone && (
                  <a href={`tel:${account.guardian_phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 hover:text-slate-900">
                    <Phone className="size-3.5" aria-hidden />
                    {account.guardian_phone}
                  </a>
                )}
                {reminder && account.balance > 0 && (
                  <a
                    href={reminder}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    <MessageCircle className="size-3.5" aria-hidden />
                    Remind on WhatsApp
                  </a>
                )}
              </p>
            )}
            {account.structure_name ? (
              <p className="mt-1 text-xs text-slate-500">Fee structure: {account.structure_name}</p>
            ) : (
              <p className="mt-1 text-xs text-amber-700">No fee structure is set for this class yet — only charges added here can be collected.</p>
            )}
          </div>
          <dl className="grid shrink-0 grid-cols-3 gap-4 text-right sm:grid-cols-1 sm:gap-1">
            <div>
              <dt className="text-xs text-slate-500">Paid so far</dt>
              <dd className="font-semibold text-emerald-700 tabular-nums">{formatCurrency(account.total_paid)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Balance due</dt>
              <dd className={cn('text-xl font-bold tabular-nums', account.balance > 0 ? (overdue.length > 0 ? 'text-red-600' : 'text-slate-900') : 'text-emerald-700')}>
                {formatCurrency(account.balance)}
              </dd>
            </div>
            {account.total_fine > 0 && (
              <div>
                <dt className="text-xs text-slate-500">Late fine in it</dt>
                <dd className="text-sm font-medium text-amber-700 tabular-nums">{formatCurrency(account.total_fine)}</dd>
              </div>
            )}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Fees and charges"
          description={
            outstanding.length === 0
              ? 'Everything is paid. Add a charge to collect something else.'
              : `Tick what is being paid now. ${overdue.length > 0 ? `${overdue.length} overdue.` : ''}`
          }
          actions={
            <>
              {outstanding.length > 0 && (
                <Button variant="ghost" size="sm" onClick={selected.length === outstanding.length ? onClearSelection : onSelectOutstanding}>
                  {selected.length === outstanding.length ? 'Clear' : 'Select all due'}
                </Button>
              )}
              <Can permissions={[FEE_PERMISSIONS.create]}>
                <Button variant="outline" size="sm" leftIcon={<Plus className="size-4" />} onClick={onAddCharge}>
                  Add a charge
                </Button>
              </Can>
            </>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th scope="col" className="w-10 px-4 py-2" />
                <th scope="col" className="px-2 py-2 text-left font-medium">Particulars</th>
                <th scope="col" className="hidden px-2 py-2 text-left font-medium sm:table-cell">Due on</th>
                <th scope="col" className="hidden px-2 py-2 text-right font-medium md:table-cell">Amount</th>
                <th scope="col" className="hidden px-2 py-2 text-right font-medium md:table-cell">Paid</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Balance</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  <span className="sr-only">Status</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dues.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    Nothing on this account yet.
                  </td>
                </tr>
              )}
              {dues.map((due) => {
                const payable = due.balance > 0;
                const checked = selected.includes(due.id);
                return (
                  <tr
                    key={due.id}
                    className={cn(payable ? 'cursor-pointer hover:bg-slate-50' : 'text-slate-400', checked && 'bg-brand-50/60')}
                    onClick={() => payable && onToggle(due.id)}
                  >
                    <td className="px-4 py-2.5" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={checked}
                        disabled={!payable}
                        onChange={() => onToggle(due.id)}
                        aria-label={`Pay ${due.installment_name}`}
                      />
                    </td>
                    <td className="px-2 py-2.5">
                      <span className={cn('font-medium', payable ? 'text-slate-900' : 'text-slate-500')}>{due.installment_name}</span>
                      {due.kind === 'charge' && (
                        <Badge tone="neutral" className="ml-2">
                          {due.charge_source === 'hostel' ? 'Hostel' : 'Charge'}
                        </Badge>
                      )}
                      {due.fine_amount > 0 && payable && (
                        <span className="ml-2 text-xs text-amber-700">incl. {formatCurrency(due.fine_amount)} late fine</span>
                      )}
                      <span className="block text-xs text-slate-500 sm:hidden">Due {formatDate(due.due_date)}</span>
                    </td>
                    <td className="hidden px-2 py-2.5 sm:table-cell">
                      {formatDate(due.due_date)}
                      {due.days_overdue > 0 && <span className="block text-xs text-red-600">{due.days_overdue} days late</span>}
                    </td>
                    <td className="hidden px-2 py-2.5 text-right tabular-nums md:table-cell">{formatCurrency(due.payable_amount)}</td>
                    <td className="hidden px-2 py-2.5 text-right tabular-nums md:table-cell">{formatCurrency(due.paid_amount)}</td>
                    <td className="px-2 py-2.5 text-right font-semibold tabular-nums">{formatCurrency(due.balance)}</td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                      <Badge tone={DUE_STATUS_TONES[due.status]}>{DUE_STATUS_LABELS[due.status]}</Badge>
                      {due.removable && (
                        <Can permissions={[FEE_PERMISSIONS.delete]}>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            className="ml-1"
                            aria-label={`Remove ${due.installment_name}`}
                            title="Remove this charge"
                            isLoading={removingId === due.id}
                            leftIcon={<Trash2 className="size-4" />}
                            onClick={() => onRemoveCharge(due)}
                          />
                        </Can>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {(recent.data?.data.length ?? 0) > 0 && (
        <Card>
          <CardHeader title="Recent receipts" description="For a parent who has lost theirs: open one to print it again." />
          <ul className="divide-y divide-slate-100">
            {recent.data!.data.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm sm:px-6">
                <div className="min-w-0">
                  <Link to={toPath(PATHS.feeReceipt, { id: payment.id })} className="font-medium text-brand-700 hover:underline">
                    {payment.receipt_no}
                  </Link>
                  <span className="ml-2 text-slate-500">
                    {formatDate(payment.paid_at)} · {PAYMENT_MODE_LABELS[payment.mode]}
                  </span>
                  {payment.is_cancelled && (
                    <Badge tone="danger" className="ml-2">
                      Cancelled
                    </Badge>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-semibold tabular-nums">{formatCurrency(payment.amount)}</span>
                  <Link
                    to={toPath(PATHS.feeReceipt, { id: payment.id })}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Open receipt ${payment.receipt_no}`}
                  >
                    <Printer className="size-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
