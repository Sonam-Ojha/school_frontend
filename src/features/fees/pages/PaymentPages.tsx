import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Ban, Download, FileSpreadsheet, FileText, Printer, Receipt, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { Form } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/FormTextarea';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { applyServerErrors } from '@/lib/formErrors';
import { formatCurrency } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { PaymentReceipt } from '../components/PaymentReceipt';
import { buildDueReportColumns, buildPaymentColumns } from '../components/columns';
import { FEE_PERMISSIONS, PAYMENT_MODE_OPTIONS } from '../constants';
import {
  useCancelPayment,
  useDownloadReceipt,
  useDueReport,
  useExportDueReport,
  usePayment,
  usePayments,
} from '../hooks/useCollection';
import { cancelPaymentSchema, type CancelPaymentInput } from '../schemas';
import type { Payment } from '../types';

// --- payment history --------------------------------------------------------

export function PaymentHistoryPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'paid_at',
    defaultSortDir: 'desc',
    filterKeys: ['mode', 'status', 'from', 'to'],
  });

  const { data, isLoading, isFetching, error } = usePayments(table.queryParams);
  const [cancelling, setCancelling] = useState<Payment | null>(null);

  const columns = buildPaymentColumns({
    onView: (payment) => navigate(toPath(PATHS.feeReceipt, { id: payment.id })),
    onCancel: setCancelling,
    canCancel: hasPermission(FEE_PERMISSIONS.approve),
    canPrint: hasPermission(FEE_PERMISSIONS.print),
  });

  return (
    <>
      <DataTable
        columns={columns}
        rows={data?.data}
        meta={data?.meta}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSort={table.toggleSort}
        onPageChange={table.setPage}
        onPerPageChange={table.setPerPage}
        onRowClick={(payment) => navigate(toPath(PATHS.feeReceipt, { id: payment.id }))}
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Receipt no., student or reference…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={
              <>
                <Select
                  aria-label="Filter by mode"
                  value={table.filters.mode ?? ''}
                  options={PAYMENT_MODE_OPTIONS}
                  placeholder="Any mode"
                  onChange={(event) => table.setFilter('mode', event.target.value || undefined)}
                  className="h-9 w-auto min-w-32 text-sm"
                />
                <Select
                  aria-label="Filter by status"
                  value={table.filters.status ?? ''}
                  options={[
                    { label: 'Valid', value: 'valid' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ]}
                  placeholder="All receipts"
                  onChange={(event) => table.setFilter('status', event.target.value || undefined)}
                  className="h-9 w-auto min-w-32 text-sm"
                />
              </>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<Receipt className="size-6" />}
            title={table.hasActiveFilters ? 'No receipts match' : 'No payments yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Receipts appear here as soon as the first payment is collected.'
            }
          />
        }
      />

      {cancelling && (
        <CancelPaymentModal
          key={cancelling.id}
          payment={cancelling}
          onClose={() => setCancelling(null)}
        />
      )}
    </>
  );
}

/**
 * Cancelling a receipt.
 *
 * A reason is mandatory — the receipt number has already been handed to a
 * parent, and a voided entry nobody can explain is worse than the mistake it
 * was meant to correct.
 */
function CancelPaymentModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const cancelPayment = useCancelPayment(payment.id);

  const form = useForm<CancelPaymentInput>({
    resolver: zodResolver(cancelPaymentSchema),
    defaultValues: { reason: '' },
  });

  const onSubmit = (values: CancelPaymentInput) => {
    cancelPayment.mutate(values, {
      onSuccess: onClose,
      onError: (error) => {
        if (applyServerErrors(error, form.setError, ['reason'])) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="sm"
      title={`Cancel receipt ${payment.receipt_no}`}
      closeOnOverlayClick={!cancelPayment.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={cancelPayment.isPending}>
            Keep receipt
          </Button>
          <Button
            type="submit"
            form="cancel-payment-form"
            variant="danger"
            isLoading={cancelPayment.isPending}
            leftIcon={<Ban className="size-4" />}
          >
            Cancel receipt
          </Button>
        </>
      }
    >
      <Form id="cancel-payment-form" form={form} onSubmit={onSubmit}>
        <Alert tone="warning">
          {formatCurrency(payment.amount)} collected from {payment.student_name} will be reversed
          and the instalments it settled become payable again. The receipt stays in the ledger,
          marked cancelled.
        </Alert>

        <FormTextarea<CancelPaymentInput>
          name="reason"
          label="Reason"
          rows={3}
          placeholder="Cheque bounced, duplicate entry, wrong student…"
          required
        />
      </Form>
    </Modal>
  );
}

// --- receipt ----------------------------------------------------------------

export function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: payment, isLoading, error } = usePayment(id);
  const { data: school } = useSettings();
  const downloadReceipt = useDownloadReceipt();

  if (isLoading) {
    return (
      <>
        <PageHeader title="Receipt" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </>
    );
  }

  if (error || !payment) {
    return (
      <>
        <PageHeader title="Receipt" />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this receipt">
              {error?.message ?? 'The receipt no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.feePayments)}>
              Back to payments
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="print-hidden">
        <PageHeader
          title={`Receipt ${payment.receipt_no}`}
          description={`${payment.student_name} · ${formatCurrency(payment.amount)}`}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => navigate(PATHS.feePayments)}
                leftIcon={<ArrowLeft className="size-4" />}
              >
                Back
              </Button>
              <Can permissions={[FEE_PERMISSIONS.print]}>
                <Button
                  variant="outline"
                  isLoading={downloadReceipt.isPending}
                  onClick={() => downloadReceipt.mutate(payment)}
                  leftIcon={<Download className="size-4" />}
                >
                  Download PDF
                </Button>
                <Button onClick={() => window.print()} leftIcon={<Printer className="size-4" />}>
                  Print
                </Button>
              </Can>
            </>
          }
        />

        {payment.is_cancelled && (
          <Alert tone="danger" className="mb-4" title="This receipt has been cancelled">
            {payment.cancelled_reason}
          </Alert>
        )}
      </div>

      <Card>
        <CardBody>
          {/* The print rules isolate this subtree; everything else is hidden. */}
          <div className="print-target">
            <PaymentReceipt payment={payment} school={school} />
          </div>
        </CardBody>
      </Card>
    </>
  );
}

// --- due report -------------------------------------------------------------

function Totals({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold ${tone ?? 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

export function DueReportPage() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'balance',
    defaultSortDir: 'desc',
    filterKeys: ['class_id', 'section_id', 'overdue_only'],
  });

  const selectedClassId = table.filters.class_id ? Number(table.filters.class_id) : null;
  const { classOptions, sectionOptions } = useClassOptions(selectedClassId);

  const { data, isLoading, isFetching, error } = useDueReport(table.queryParams);
  const exportReport = useExportDueReport();

  const columns = buildDueReportColumns(
    (row) => {
      // Send the cashier straight to the collection screen for that student.
      setSearchParams({});
      navigate(`${PATHS.feeCollection}?student_id=${row.student_id}`);
    },
    hasPermission(FEE_PERMISSIONS.create),
  );

  const rows = (data?.data ?? []).map((row) => ({ ...row, id: row.student_id }));
  const totals = data?.totals;

  return (
    <div className="space-y-4">
      {totals && (
        <Card>
          <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Totals label="Students with dues" value={String(totals.students)} />
            <Totals label="Total payable" value={formatCurrency(totals.total_payable)} />
            <Totals label="Collected" value={formatCurrency(totals.total_paid)} tone="text-emerald-700" />
            <Totals
              label="Outstanding"
              value={formatCurrency(totals.total_outstanding)}
              tone="text-red-700"
            />
            <Totals
              label="Overdue students"
              value={String(totals.overdue_students)}
              tone={totals.overdue_students > 0 ? 'text-red-700' : undefined}
            />
          </CardBody>
        </Card>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        meta={data?.meta}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSort={table.toggleSort}
        onPageChange={table.setPage}
        onPerPageChange={table.setPerPage}
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Student name or admission no.…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={
              <>
                <Select
                  aria-label="Filter by class"
                  value={table.filters.class_id ?? ''}
                  options={classOptions}
                  placeholder="All classes"
                  onChange={(event) => {
                    table.setFilter('class_id', event.target.value || undefined);
                    table.setFilter('section_id', undefined);
                  }}
                  className="h-9 w-auto min-w-36 text-sm"
                />
                <Select
                  aria-label="Filter by section"
                  value={table.filters.section_id ?? ''}
                  options={sectionOptions}
                  placeholder="All sections"
                  disabled={sectionOptions.length === 0}
                  onChange={(event) =>
                    table.setFilter('section_id', event.target.value || undefined)
                  }
                  className="h-9 w-auto min-w-32 text-sm"
                />
                <Select
                  aria-label="Overdue only"
                  value={table.filters.overdue_only ?? ''}
                  options={[{ label: 'Overdue only', value: '1' }]}
                  placeholder="All with dues"
                  onChange={(event) =>
                    table.setFilter('overdue_only', event.target.value || undefined)
                  }
                  className="h-9 w-auto min-w-36 text-sm"
                />
              </>
            }
            actions={
              <Can permissions={[FEE_PERMISSIONS.export]}>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    isLoading={exportReport.isPending}
                    onClick={() =>
                      exportReport.mutate({ params: table.queryParams, format: 'excel' })
                    }
                    leftIcon={<FileSpreadsheet className="size-4" />}
                  >
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    isLoading={exportReport.isPending}
                    onClick={() => exportReport.mutate({ params: table.queryParams, format: 'pdf' })}
                    leftIcon={<FileText className="size-4" />}
                  >
                    PDF
                  </Button>
                </div>
              </Can>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<TrendingDown className="size-6" />}
            title={table.hasActiveFilters ? 'No students match' : 'Nothing outstanding'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Every student is up to date on their fees.'
            }
          />
        }
      />
    </div>
  );
}
