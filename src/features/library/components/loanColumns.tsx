import { RotateCw, Undo2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/format';

import { LOAN_STATUS_LABELS, LOAN_STATUS_TONES, MAX_RENEWALS, MEMBER_TYPE_LABELS } from '../constants';
import type { Loan } from '../types';

interface LoanColumnOptions {
  onReturn?: (loan: Loan) => void;
  onRenew?: (loan: Loan) => void;
  canUpdate: boolean;
}

/** The due date, and how far past it the book is. */
function renderDue(loan: Loan) {
  const isOut = loan.returned_on === null;

  return (
    <div>
      <p className="text-sm whitespace-nowrap text-slate-800">{formatDate(loan.due_on)}</p>
      {loan.days_overdue > 0 && (
        <p
          className={cn(
            'text-xs whitespace-nowrap font-medium',
            isOut ? 'text-red-600' : 'text-slate-500',
          )}
        >
          {loan.days_overdue} day{loan.days_overdue === 1 ? '' : 's'} {isOut ? 'overdue' : 'late'}
        </p>
      )}
    </div>
  );
}

export function buildLoanColumns({
  onReturn,
  onRenew,
  canUpdate,
}: LoanColumnOptions): Column<Loan>[] {
  return [
    {
      key: 'book_title',
      header: 'Book',
      sortable: true,
      cell: (loan) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{loan.book_title}</p>
          <p className="truncate text-xs text-slate-500">
            <code>{loan.accession_no}</code> · {loan.book_author}
          </p>
        </div>
      ),
    },
    {
      key: 'member_name',
      header: 'Member',
      sortable: true,
      cell: (loan) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-900">{loan.member_name}</p>
          <p className="truncate text-xs text-slate-500">
            <code>{loan.member_identifier}</code> · {MEMBER_TYPE_LABELS[loan.member_type]}
          </p>
        </div>
      ),
    },
    {
      key: 'issued_on',
      header: 'Issued',
      sortable: true,
      hideBelow: 'lg',
      cell: (loan) => formatDate(loan.issued_on),
    },
    {
      key: 'due_on',
      header: 'Due',
      sortable: true,
      cell: renderDue,
    },
    {
      key: 'returned_on',
      header: 'Returned',
      sortable: true,
      hideBelow: 'xl',
      cell: (loan) => (loan.returned_on ? formatDate(loan.returned_on) : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (loan) => (
        <Badge tone={LOAN_STATUS_TONES[loan.status]} withDot>
          {LOAN_STATUS_LABELS[loan.status]}
        </Badge>
      ),
    },
    {
      key: 'fine_due',
      header: 'Fine',
      sortable: true,
      align: 'right',
      cell: (loan) => {
        if (loan.fine_amount === 0) return <span className="text-xs text-slate-400">—</span>;

        return (
          <div>
            <p
              className={cn(
                'text-sm font-semibold',
                loan.fine_due > 0 ? 'text-red-700' : 'text-emerald-700',
              )}
            >
              {formatCurrency(loan.fine_due > 0 ? loan.fine_due : loan.fine_amount)}
            </p>
            <p className="text-xs whitespace-nowrap text-slate-500">
              {loan.fine_due > 0
                ? 'outstanding'
                : loan.fine_waived > 0
                  ? 'waived'
                  : 'paid'}
            </p>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (loan) => {
        const isOut = loan.returned_on === null;
        if (!canUpdate || !isOut) return null;

        return (
          <div className="flex justify-end gap-1">
            {onRenew && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                // A book already overdue must come back, not go out again.
                disabled={loan.renewals >= MAX_RENEWALS || loan.days_overdue > 0}
                aria-label={`Renew ${loan.book_title}`}
                title={
                  loan.days_overdue > 0
                    ? 'Overdue books cannot be renewed'
                    : loan.renewals >= MAX_RENEWALS
                      ? `Already renewed ${MAX_RENEWALS} times`
                      : 'Renew'
                }
                onClick={() => onRenew(loan)}
              >
                <RotateCw className="size-4" />
              </Button>
            )}

            {onReturn && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={`Return ${loan.book_title}`}
                title="Return"
                onClick={() => onReturn(loan)}
              >
                <Undo2 className="size-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
