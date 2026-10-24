import { Ban, Check, FileDown, FileSpreadsheet, MoreHorizontal, Pencil, Plus, Printer, Tags, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { PATHS } from '@/app/router/paths';
import { PrintOnly } from '@/components/feedback/PrintOnly';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { PAYMENT_MODE_OPTIONS } from '@/features/fees/constants';
import { useSettings } from '@/features/settings/hooks/useSettings';
import type { SchoolSettings } from '@/features/settings/types';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { formatCurrency, formatDate, formatDateTime, rupeesInWords } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { CategoriesModal } from '../components/CategoriesModal';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { ReasonModal } from '../components/ReasonModal';
import { EXPENSE_PERMISSIONS, EXPENSE_STATUS, EXPENSE_STATUS_OPTIONS } from '../constants';
import { useDecideExpense, useDeleteExpense, useExpenseCategories, useExpenses, useExportExpenses } from '../hooks/useExpenses';
import type { Expense } from '../types';

/** The first and last day of this month, as the book opens. */
function thisMonth(): { from: string; to: string } {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return { from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, to: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(last)}` };
}

/** A printed payment voucher, for the bill file and the principal's signature. */
function Voucher({ expense, school }: { expense: Expense; school: SchoolSettings | undefined }) {
  return (
    <article className="print-exact mx-auto max-w-3xl border border-slate-300 bg-white p-6 text-slate-900">
      <header className="flex items-start justify-between gap-4 border-b-2 border-slate-800 pb-3">
        <div>
          <p className="text-lg font-bold uppercase">{school?.profile.name ?? 'School'}</p>
          <p className="text-xs text-slate-600">
            {school ? [school.address.line1, school.address.city, school.address.postal_code].filter(Boolean).join(', ') : ''}
          </p>
        </div>
        <p className="rounded border border-slate-800 px-2 py-0.5 text-xs font-bold tracking-wider uppercase">Payment voucher</p>
      </header>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 py-4 text-sm">
        <div>
          <dt className="text-[10px] text-slate-500 uppercase">Voucher no.</dt>
          <dd className="font-semibold">{expense.voucher_no}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-slate-500 uppercase">Date</dt>
          <dd className="font-semibold">{formatDate(expense.date)}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-slate-500 uppercase">Paid to</dt>
          <dd className="font-semibold">{expense.paid_to}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-slate-500 uppercase">Head of account</dt>
          <dd className="font-semibold">{expense.category_name}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[10px] text-slate-500 uppercase">Towards</dt>
          <dd>{expense.description ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-slate-500 uppercase">Paid by</dt>
          <dd>
            {expense.mode_label}
            {expense.reference ? ` · ${expense.reference}` : ''}
            {expense.bank_name ? ` · ${expense.bank_name}` : ''}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-slate-500 uppercase">Bill no.</dt>
          <dd>{expense.bill_no ?? '—'}</dd>
        </div>
      </dl>
      <div className="flex items-baseline justify-between border-y-2 border-slate-800 py-2">
        <span className="text-sm font-semibold">Amount</span>
        <span className="text-xl font-bold tabular-nums">{formatCurrency(expense.amount)}</span>
      </div>
      <p className="mt-2 text-sm font-semibold">{rupeesInWords(expense.amount)}</p>
      <p className="mt-1 text-xs text-slate-500">
        Recorded by {expense.recorded_by}, {formatDateTime(expense.recorded_at)} · {EXPENSE_STATUS[expense.status].label}
        {expense.decided_by && expense.status !== 'pending' ? ` by ${expense.decided_by}` : ''}
      </p>
      <div className="mt-12 grid grid-cols-3 gap-6 text-center text-xs">
        {['Prepared by (Accountant)', 'Approved by (Principal)', 'Receiver’s signature'].map((label) => (
          <div key={label}>
            <div className="h-8 border-b border-slate-500" />
            <p className="mt-1">{label}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

/**
 * The expense book: every rupee the school pays out, with a voucher number,
 * filed under a head of account. The accountant records; the principal
 * approves. Totals by head for the chosen period sit on top.
 */
export default function ExpensesPage() {
  const month = thisMonth();
  const table = useTableQueryState({ defaultSortBy: 'date', defaultSortDir: 'desc', filterKeys: ['from', 'to', 'category_id', 'status', 'mode'] });
  const from = table.filters.from ?? month.from;
  const to = table.filters.to ?? month.to;
  const params = { ...table.queryParams, from, to };

  const { data, isLoading, isFetching, error } = useExpenses(params);
  const categories = useExpenseCategories();
  const { data: school } = useSettings();
  const decide = useDecideExpense();
  const remove = useDeleteExpense();
  const exportList = useExportExpenses();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canApprove = hasPermission(EXPENSE_PERMISSIONS.approve);

  const [editing, setEditing] = useState<Expense | null | 'new'>(null);
  const [managing, setManaging] = useState(false);
  const [rejecting, setRejecting] = useState<Expense | null>(null);
  const [cancelling, setCancelling] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [viewing, setViewing] = useState<Expense | null>(null);

  const totals = data?.totals;
  const topCategories = totals?.by_category.slice(0, 6) ?? [];
  const biggest = Math.max(1, ...topCategories.map((entry) => entry.amount));

  const columns: Column<Expense>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      cell: (expense) => (
        <div>
          <p className="text-slate-900">{formatDate(expense.date)}</p>
          <p className="text-xs text-slate-500">{expense.voucher_no}</p>
        </div>
      ),
    },
    {
      key: 'paid_to',
      header: 'Paid to',
      sortable: true,
      cell: (expense) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{expense.paid_to}</p>
          <p className="max-w-80 truncate text-xs text-slate-500" title={expense.description ?? ''}>
            {expense.category_name}
            {expense.description ? ` · ${expense.description}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'mode',
      header: 'Paid by',
      hideBelow: 'md',
      cell: (expense) => (
        <div>
          <p className="text-slate-700">{expense.mode_label}</p>
          {expense.reference && <p className="text-xs text-slate-500">{expense.reference}</p>}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      cell: (expense) => (
        <span className={expense.status === 'rejected' || expense.status === 'cancelled' ? 'text-slate-400 line-through tabular-nums' : 'font-semibold tabular-nums'}>
          {formatCurrency(expense.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      hideBelow: 'sm',
      cell: (expense) => (
        <div>
          <Badge tone={EXPENSE_STATUS[expense.status].tone}>{EXPENSE_STATUS[expense.status].label}</Badge>
          {expense.decision_note && <p className="mt-0.5 max-w-48 truncate text-xs text-slate-500" title={expense.decision_note}>{expense.decision_note}</p>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (expense) => (
        <div className="flex justify-end gap-1 whitespace-nowrap">
          {expense.status === 'pending' && canApprove && (
            <>
              <Button size="sm" leftIcon={<Check className="size-4" />} isLoading={decide.isPending && decide.variables?.id === expense.id && decide.variables?.action === 'approve'} onClick={() => decide.mutate({ id: expense.id, action: 'approve' })}>
                Approve
              </Button>
              <Button size="sm" variant="ghost" iconOnly aria-label="Reject" title="Reject" leftIcon={<X className="size-4" />} onClick={() => setRejecting(expense)} />
            </>
          )}
          <Button size="sm" variant="ghost" iconOnly aria-label={`Open voucher ${expense.voucher_no}`} title="Voucher" leftIcon={<MoreHorizontal className="size-4" />} onClick={() => setViewing(expense)} />
        </div>
      ),
    },
  ];

  const filters = (
    <>
      <Input type="date" value={from} max={to} onChange={(event) => table.setFilter('from', event.target.value || undefined)} className="h-9 w-38" aria-label="From" />
      <Input type="date" value={to} min={from} onChange={(event) => table.setFilter('to', event.target.value || undefined)} className="h-9 w-38" aria-label="To" />
      <Select
        options={[{ label: 'All categories', value: '' }, ...(categories.data ?? []).map((category) => ({ label: category.name, value: String(category.id) }))]}
        value={table.filters.category_id ?? ''}
        onChange={(event) => table.setFilter('category_id', event.target.value || undefined)}
        className="h-9 w-48"
        aria-label="Category"
      />
      <Select options={EXPENSE_STATUS_OPTIONS} value={table.filters.status ?? ''} onChange={(event) => table.setFilter('status', event.target.value || undefined)} className="h-9 w-44" aria-label="Status" />
      <Select
        options={[{ label: 'Any mode', value: '' }, ...PAYMENT_MODE_OPTIONS]}
        value={table.filters.mode ?? ''}
        onChange={(event) => table.setFilter('mode', event.target.value || undefined)}
        className="h-9 w-36"
        aria-label="Paid by"
      />
    </>
  );

  return (
    <>
      <PageHeader
        title="Expenses"
        description="What the school pays out — bills, supplies, repairs, events — with a voucher for each, approved by the principal."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Expenses' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Tags className="size-4" />} onClick={() => setManaging(true)}>
              Categories
            </Button>
            <Can permissions={[EXPENSE_PERMISSIONS.create]}>
              <Button leftIcon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
                Record expense
              </Button>
            </Can>
          </>
        }
      />

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardBody>
              <p className="text-xs text-slate-500">Spent {formatDate(from)} – {formatDate(to)}</p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums">{formatCurrency(totals?.amount ?? 0)}</p>
              <p className="text-xs text-slate-500">{totals?.count ?? 0} vouchers · {formatCurrency(totals?.cash ?? 0)} in cash</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-slate-500">Awaiting approval</p>
              <p className="mt-0.5 text-2xl font-semibold text-amber-700 tabular-nums">{formatCurrency(totals?.pending_amount ?? 0)}</p>
              <button type="button" className="text-xs font-medium text-brand-700 hover:underline" onClick={() => table.setFilter('status', 'pending')}>
                {totals?.pending ?? 0} voucher{totals?.pending === 1 ? '' : 's'} — show them
              </button>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="mb-2 text-xs text-slate-500">Biggest heads</p>
              {topCategories.length === 0 ? (
                <p className="text-sm text-slate-500">Nothing yet in this period.</p>
              ) : (
                <ul className="space-y-1.5">
                  {topCategories.slice(0, 4).map((entry) => (
                    <li key={entry.category_id} className="text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="truncate text-slate-700">{entry.name}</span>
                        <span className="tabular-nums text-slate-900">{formatCurrency(entry.amount)}</span>
                      </div>
                      <div className="mt-0.5 h-1.5 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(3, (entry.amount / biggest) * 100)}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <DataTable
            columns={columns}
            rows={data?.data}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            meta={data?.meta}
            onPageChange={table.setPage}
            onPerPageChange={table.setPerPage}
            sortBy={table.sortBy}
            sortDir={table.sortDir}
            onSort={table.toggleSort}
            onRowClick={setViewing}
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Voucher, paid to, bill no…"
                filters={filters}
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                actions={
                  <Can permissions={[EXPENSE_PERMISSIONS.export]}>
                    <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet className="size-4" />} isLoading={exportList.isPending && exportList.variables?.format === 'excel'} onClick={() => exportList.mutate({ params, format: 'excel' })}>
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<FileDown className="size-4" />} isLoading={exportList.isPending && exportList.variables?.format === 'pdf'} onClick={() => exportList.mutate({ params, format: 'pdf' })}>
                      PDF
                    </Button>
                  </Can>
                }
              />
            }
            emptyState={
              <EmptyState
                title="No expenses in this period"
                description="Record a bill or a purchase, or widen the dates."
                action={
                  <Can permissions={[EXPENSE_PERMISSIONS.create]}>
                    <Button leftIcon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
                      Record expense
                    </Button>
                  </Can>
                }
              />
            }
          />
        </Card>
      </div>

      <ExpenseFormModal isOpen={editing !== null} onClose={() => setEditing(null)} expense={editing === 'new' ? null : editing} />
      <CategoriesModal isOpen={managing} onClose={() => setManaging(false)} />

      {/* One voucher: everything about it, and what can still be done with it. */}
      <Modal
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        size="xl"
        title={viewing ? `Voucher ${viewing.voucher_no}` : ''}
        description={viewing ? `${EXPENSE_STATUS[viewing.status].label}${viewing.decided_by && viewing.status !== 'pending' ? ` by ${viewing.decided_by}` : ''}` : undefined}
        footer={
          viewing && (
            <div className="flex w-full flex-wrap justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {viewing.can_edit && hasPermission(EXPENSE_PERMISSIONS.update) && (
                  <Button variant="outline" leftIcon={<Pencil className="size-4" />} onClick={() => { setEditing(viewing); setViewing(null); }}>
                    Edit
                  </Button>
                )}
                {(viewing.status === 'pending' || viewing.status === 'approved') && (hasPermission(EXPENSE_PERMISSIONS.update) || canApprove) && (
                  <Button variant="outline" leftIcon={<Ban className="size-4" />} onClick={() => { setCancelling(viewing); setViewing(null); }}>
                    Cancel voucher
                  </Button>
                )}
                {(viewing.status === 'pending' || viewing.status === 'rejected') && hasPermission(EXPENSE_PERMISSIONS.delete) && (
                  <Button variant="ghost" leftIcon={<Trash2 className="size-4" />} onClick={() => { setDeleting(viewing); setViewing(null); }}>
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {viewing.status === 'pending' && canApprove && (
                  <Button
                    variant="outline"
                    leftIcon={<Check className="size-4" />}
                    isLoading={decide.isPending}
                    onClick={() => decide.mutate({ id: viewing.id, action: 'approve' }, { onSuccess: ({ expense }) => setViewing(expense) })}
                  >
                    Approve
                  </Button>
                )}
                <Button leftIcon={<Printer className="size-4" />} onClick={() => window.print()}>
                  Print voucher
                </Button>
              </div>
            </div>
          )
        }
      >
        {viewing && (
          <div className="max-h-[60vh] overflow-y-auto rounded-lg bg-slate-100 p-3">
            <Voucher expense={viewing} school={school} />
          </div>
        )}
      </Modal>
      {viewing && (
        <PrintOnly>
          <Voucher expense={viewing} school={school} />
        </PrintOnly>
      )}

      <ReasonModal
        isOpen={rejecting !== null}
        title={`Reject ${rejecting?.voucher_no ?? ''}`}
        description="It stays on record as rejected and no longer counts in the totals."
        confirmLabel="Reject"
        isPending={decide.isPending}
        onClose={() => setRejecting(null)}
        onConfirm={(reason) => rejecting && decide.mutate({ id: rejecting.id, action: 'reject', reason }, { onSuccess: () => setRejecting(null) })}
      />
      <ReasonModal
        isOpen={cancelling !== null}
        title={`Cancel ${cancelling?.voucher_no ?? ''}`}
        description="For an entry made in error or money returned. It stays on record, cancelled, with your reason."
        confirmLabel="Cancel voucher"
        isPending={decide.isPending}
        onClose={() => setCancelling(null)}
        onConfirm={(reason) => cancelling && decide.mutate({ id: cancelling.id, action: 'cancel', reason }, { onSuccess: () => setCancelling(null) })}
      />
      <ConfirmDialog
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        title={`Delete ${deleting?.voucher_no ?? ''}?`}
        message="Only an entry not yet approved can be deleted. This cannot be undone."
        confirmLabel="Delete"
        isDestructive
        isLoading={remove.isPending}
      />
    </>
  );
}
