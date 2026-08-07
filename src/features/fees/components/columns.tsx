import { Ban, Pencil, Phone, Printer, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/format';

import { FEE_CATEGORY_LABELS, PAYMENT_MODE_LABELS } from '../constants';
import type { Discount, DueReportRow, FeeStructure, FeeType, Payment } from '../types';

/**
 * Column definitions for every fee table.
 *
 * Grouped in one file because they are all thin factories over the same
 * primitives; splitting them would be five files of identical imports.
 */

interface EditDeleteOptions<T> {
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/** Shared trailing actions column. */
function actionsColumn<T extends { id: number }>(
  label: (row: T) => string,
  { onEdit, onDelete, canUpdate, canDelete }: EditDeleteOptions<T>,
): Column<T> {
  return {
    key: 'actions',
    header: <span className="sr-only">Actions</span>,
    align: 'right',
    width: '1%',
    cell: (row) => (
      <div className="flex items-center justify-end gap-0.5">
        {canUpdate && (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`Edit ${label(row)}`}
            onClick={() => onEdit(row)}
            leftIcon={<Pencil className="size-4" />}
          />
        )}
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`Delete ${label(row)}`}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDelete(row)}
            leftIcon={<Trash2 className="size-4" />}
          />
        )}
      </div>
    ),
  };
}

export function buildFeeTypeColumns(options: EditDeleteOptions<FeeType>): Column<FeeType>[] {
  return [
    {
      key: 'name',
      header: 'Fee type',
      sortable: true,
      cell: (type) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{type.name}</span>
            {!type.is_active && <Badge tone="neutral">Inactive</Badge>}
          </div>
          {type.description && (
            <p className="truncate text-xs text-slate-500">{type.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      hideBelow: 'sm',
      cell: (type) => <code className="text-xs text-slate-600">{type.code}</code>,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      hideBelow: 'md',
      cell: (type) => FEE_CATEGORY_LABELS[type.category],
    },
    {
      key: 'flags',
      header: 'Behaviour',
      hideBelow: 'lg',
      cell: (type) => (
        <div className="flex flex-wrap gap-1">
          <Badge tone={type.is_recurring ? 'info' : 'neutral'}>
            {type.is_recurring ? 'Recurring' : 'One time'}
          </Badge>
          {type.is_refundable && <Badge tone="success">Refundable</Badge>}
        </div>
      ),
    },
    {
      key: 'structures_count',
      header: 'In use',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (type) =>
        type.structures_count > 0 ? (
          `${type.structures_count} structure${type.structures_count === 1 ? '' : 's'}`
        ) : (
          <span className="text-slate-400">Unused</span>
        ),
    },
    actionsColumn((type) => type.name, options),
  ];
}

export function buildDiscountColumns(options: EditDeleteOptions<Discount>): Column<Discount>[] {
  return [
    {
      key: 'name',
      header: 'Discount',
      sortable: true,
      cell: (discount) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{discount.name}</span>
            {!discount.is_active && <Badge tone="neutral">Inactive</Badge>}
          </div>
          {discount.description && (
            <p className="truncate text-xs text-slate-500">{discount.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      hideBelow: 'sm',
      cell: (discount) => <code className="text-xs text-slate-600">{discount.code}</code>,
    },
    {
      key: 'value',
      header: 'Value',
      sortable: true,
      align: 'right',
      cell: (discount) =>
        discount.value_type === 'percentage'
          ? `${discount.value}%`
          : formatCurrency(discount.value),
    },
    {
      key: 'usages_count',
      header: 'Applied',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (discount) =>
        discount.usages_count > 0 ? (
          `${discount.usages_count}×`
        ) : (
          <span className="text-slate-400">Never</span>
        ),
    },
    actionsColumn((discount) => discount.name, options),
  ];
}

export function buildStructureColumns(
  options: EditDeleteOptions<FeeStructure> & { onView: (row: FeeStructure) => void },
): Column<FeeStructure>[] {
  return [
    {
      key: 'name',
      header: 'Structure',
      sortable: true,
      cell: (structure) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{structure.name}</span>
            {!structure.is_active && <Badge tone="neutral">Inactive</Badge>}
          </div>
          <p className="truncate text-xs text-slate-500">
            {structure.class_name}
            {structure.section_name ? ` — ${structure.section_name}` : ' — all sections'}
            {` · ${structure.academic_year_name}`}
          </p>
        </div>
      ),
    },
    {
      key: 'items_count',
      header: 'Lines',
      align: 'right',
      hideBelow: 'md',
      cell: (structure) => structure.items_count,
    },
    {
      key: 'installments_count',
      header: 'Instalments',
      align: 'right',
      hideBelow: 'md',
      cell: (structure) => structure.installments_count,
    },
    {
      key: 'total_amount',
      header: 'Total',
      sortable: true,
      align: 'right',
      cell: (structure) => (
        <span className="font-medium text-slate-900">{formatCurrency(structure.total_amount)}</span>
      ),
    },
    {
      key: 'students_count',
      header: 'Students',
      sortable: true,
      align: 'right',
      hideBelow: 'lg',
      cell: (structure) => structure.students_count,
    },
    actionsColumn((structure) => structure.name, options),
  ];
}

interface PaymentColumnOptions {
  onView: (payment: Payment) => void;
  onCancel: (payment: Payment) => void;
  canCancel: boolean;
  canPrint: boolean;
}

export function buildPaymentColumns({
  onView,
  onCancel,
  canCancel,
  canPrint,
}: PaymentColumnOptions): Column<Payment>[] {
  return [
    {
      key: 'receipt_no',
      header: 'Receipt',
      sortable: true,
      cell: (payment) => (
        <div className="min-w-0">
          <code
            className={cn(
              'text-xs font-medium',
              payment.is_cancelled ? 'text-slate-400 line-through' : 'text-slate-900',
            )}
          >
            {payment.receipt_no}
          </code>
          {payment.is_cancelled && (
            <Badge tone="danger" className="ml-2">
              Cancelled
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'student_name',
      header: 'Student',
      sortable: true,
      cell: (payment) => (
        <div className="min-w-0">
          <p className="truncate text-slate-900">{payment.student_name}</p>
          <p className="truncate text-xs text-slate-500">
            <code>{payment.admission_no}</code>
            {` · ${payment.class_name}${payment.section_name ? ` — ${payment.section_name}` : ''}`}
          </p>
        </div>
      ),
    },
    {
      key: 'paid_at',
      header: 'Date',
      sortable: true,
      hideBelow: 'md',
      cell: (payment) => formatDate(payment.paid_at),
    },
    {
      key: 'mode',
      header: 'Mode',
      hideBelow: 'lg',
      cell: (payment) => (
        <div className="min-w-0">
          <p className="text-slate-700">{PAYMENT_MODE_LABELS[payment.mode]}</p>
          {payment.reference && (
            <p className="truncate text-xs text-slate-500">{payment.reference}</p>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      cell: (payment) => (
        <span
          className={cn(
            'font-semibold',
            payment.is_cancelled ? 'text-slate-400 line-through' : 'text-slate-900',
          )}
        >
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (payment) => (
        <div className="flex items-center justify-end gap-0.5">
          {canPrint && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Open receipt ${payment.receipt_no}`}
              onClick={() => onView(payment)}
              leftIcon={<Printer className="size-4" />}
            />
          )}
          {/* A cancelled receipt cannot be cancelled again. */}
          {canCancel && !payment.is_cancelled && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Cancel receipt ${payment.receipt_no}`}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onCancel(payment)}
              leftIcon={<Ban className="size-4" />}
            />
          )}
        </div>
      ),
    },
  ];
}

export function buildDueReportColumns(
  onCollect: (row: DueReportRow) => void,
  canCollect: boolean,
): Column<DueReportRow & { id: number }>[] {
  return [
    {
      key: 'student_name',
      header: 'Student',
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{row.student_name}</p>
          <p className="truncate text-xs text-slate-500">
            <code>{row.admission_no}</code>
            {` · ${row.class_name}${row.section_name ? ` — ${row.section_name}` : ''}`}
          </p>
        </div>
      ),
    },
    {
      key: 'guardian_name',
      header: 'Guardian',
      hideBelow: 'lg',
      cell: (row) =>
        row.guardian_name ? (
          <div className="min-w-0">
            <p className="truncate text-slate-800">{row.guardian_name}</p>
            {row.guardian_phone && (
              <a
                href={`tel:${row.guardian_phone}`}
                className="flex items-center gap-1 truncate text-xs text-brand-600 hover:underline"
              >
                <Phone className="size-3" aria-hidden />
                {row.guardian_phone}
              </a>
            )}
          </div>
        ) : (
          <span className="text-slate-400">Not recorded</span>
        ),
    },
    {
      key: 'total_payable',
      header: 'Payable',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (row) => formatCurrency(row.total_payable),
    },
    {
      key: 'total_paid',
      header: 'Paid',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (row) => formatCurrency(row.total_paid),
    },
    {
      key: 'balance',
      header: 'Outstanding',
      sortable: true,
      align: 'right',
      cell: (row) => (
        <span className="font-semibold text-red-700">{formatCurrency(row.balance)}</span>
      ),
    },
    {
      key: 'days_overdue',
      header: 'Overdue',
      sortable: true,
      align: 'right',
      hideBelow: 'sm',
      cell: (row) =>
        row.days_overdue > 0 ? (
          <span className="text-red-700">
            {row.days_overdue}d
            <span className="ml-1 text-xs text-slate-500">
              ({row.overdue_installments} inst.)
            </span>
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (row) =>
        canCollect ? (
          <Button variant="outline" size="sm" onClick={() => onCollect(row)}>
            Collect
          </Button>
        ) : null,
    },
  ];
}
