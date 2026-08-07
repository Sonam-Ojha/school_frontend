import { AlertTriangle, Receipt, Wallet } from 'lucide-react';

import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/format';

import { DUE_STATUS_LABELS, DUE_STATUS_TONES, FEE_PERMISSIONS } from '../constants';
import type { StudentFeeAccount } from '../types';

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn('mt-0.5 text-lg font-semibold', tone ?? 'text-slate-900')}>{value}</p>
    </div>
  );
}

interface StudentDuesCardProps {
  account: StudentFeeAccount;
  onCollect: () => void;
}

/**
 * A student's fee position: totals at the top, instalments below.
 *
 * Gross, discount and fine are shown per instalment rather than only as a
 * net figure — a parent disputing a bill asks about exactly those three, and
 * a single "payable" number cannot answer them.
 */
export function StudentDuesCard({ account, onCollect }: StudentDuesCardProps) {
  const hasStructure = account.structure_id !== null;
  const isSettled = account.balance <= 0;
  const overdue = account.dues.filter((due) => due.status === 'overdue');

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar name={account.student_name} src={account.photo_url} size="lg" />

            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-slate-900">{account.student_name}</p>
              <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                <code>{account.admission_no}</code>
                <span>
                  {account.class_name}
                  {account.section_name ? ` — ${account.section_name}` : ''}
                </span>
                {account.structure_name && <span>{account.structure_name}</span>}
              </p>
            </div>

            <Can permissions={[FEE_PERMISSIONS.create]}>
              <Button
                onClick={onCollect}
                disabled={!hasStructure || isSettled}
                leftIcon={<Wallet className="size-4" />}
              >
                Collect payment
              </Button>
            </Can>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-5">
            <Stat label="Total payable" value={formatCurrency(account.total_payable)} />
            <Stat
              label="Discount"
              value={formatCurrency(account.total_discount)}
              tone="text-emerald-700"
            />
            <Stat label="Fine" value={formatCurrency(account.total_fine)} tone="text-amber-700" />
            <Stat label="Paid" value={formatCurrency(account.total_paid)} />
            <Stat
              label="Balance"
              value={formatCurrency(account.balance)}
              tone={account.balance > 0 ? 'text-red-700' : 'text-emerald-700'}
            />
          </div>
        </CardBody>
      </Card>

      {!hasStructure && (
        <Alert tone="warning" title="No fee structure assigned">
          This student&apos;s class has no active fee structure for the current session, so
          nothing can be billed or collected yet.
        </Alert>
      )}

      {overdue.length > 0 && (
        <Alert tone="danger" title={`${overdue.length} overdue instalment${overdue.length === 1 ? '' : 's'}`}>
          The oldest is {overdue[0].days_overdue} day{overdue[0].days_overdue === 1 ? '' : 's'} past
          its due date. Fines shown below have already been applied.
        </Alert>
      )}

      <Card>
        <CardHeader
          title="Instalments"
          description={isSettled ? 'All dues are settled.' : 'Payments settle the oldest due first.'}
        />

        <CardBody className="p-0">
          {account.dues.length === 0 ? (
            <EmptyState
              icon={<Receipt className="size-6" />}
              title="Nothing due"
              description="No instalments have been raised for this student."
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
                    <th scope="col" className="px-4 py-2.5 text-left font-semibold">Instalment</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Due</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Gross</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Discount</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Fine</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Payable</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Paid</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Balance</th>
                    <th scope="col" className="px-4 py-2.5 text-left font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {account.dues.map((due) => (
                    <tr
                      key={due.id}
                      className={cn(
                        'border-b border-slate-100 last:border-0',
                        due.status === 'overdue' && 'bg-red-50/40',
                      )}
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900">
                        {due.installment_name}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {formatDate(due.due_date)}
                        {due.days_overdue > 0 && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-red-600">
                            <AlertTriangle className="size-3" aria-hidden />
                            {due.days_overdue}d
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-700">
                        {formatCurrency(due.gross_amount)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-emerald-700">
                        {due.discount_amount > 0 ? `−${formatCurrency(due.discount_amount)}` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right text-amber-700">
                        {due.fine_amount > 0 ? `+${formatCurrency(due.fine_amount)}` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-900">
                        {formatCurrency(due.payable_amount)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-700">
                        {formatCurrency(due.paid_amount)}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-2.5 text-right font-semibold',
                          due.balance > 0 ? 'text-red-700' : 'text-emerald-700',
                        )}
                      >
                        {formatCurrency(due.balance)}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={DUE_STATUS_TONES[due.status]}>
                          {DUE_STATUS_LABELS[due.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
