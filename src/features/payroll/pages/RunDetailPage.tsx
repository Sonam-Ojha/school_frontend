import {
  ArrowLeft,
  BadgeCheck,
  Calculator,
  FileSpreadsheet,
  Printer,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate, todayInputValue } from '@/lib/format';

import {
  PAYROLL_PERMISSIONS,
  RUN_STATUS_LABELS,
  RUN_STATUS_TONES,
  canTransition,
} from '../constants';
import {
  useApproveRun,
  useDownloadPayslips,
  useExportRun,
  useMarkPaid,
  useProcessRun,
  useRun,
} from '../hooks/usePayroll';

export default function RunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const runId = Number(id);

  const { data: run, isLoading, error } = useRun(id);
  const processRun = useProcessRun();
  const approveRun = useApproveRun();
  const markPaid = useMarkPaid();
  const downloadPayslips = useDownloadPayslips();
  const exportRun = useExportRun();

  const processDialog = useDisclosure();
  const approveDialog = useDisclosure();
  const payDialog = useDisclosure();
  const [paidOn, setPaidOn] = useState(todayInputValue());
  const [reference, setReference] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !run) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load this payroll">
            {error?.message ?? 'It no longer exists.'}
          </Alert>
          <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.payrollRuns)}>
            Back to runs
          </Button>
        </CardBody>
      </Card>
    );
  }

  const canProcess = canTransition(run.status, 'processed');
  const canApprove = canTransition(run.status, 'approved');
  const canPay = canTransition(run.status, 'paid');

  return (
    <>
      <PageHeader
        title={`Payroll — ${run.month}`}
        description={
          run.processed_at
            ? `Processed ${formatDate(run.processed_at)} by ${run.processed_by ?? 'the system'}`
            : 'Not yet costed'
        }
        breadcrumbs={[{ label: 'Payroll', to: PATHS.payrollRuns }, { label: run.month }]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(PATHS.payrollRuns)}
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Back
            </Button>

            {run.payslips.length > 0 && (
              <>
                <Can permissions={[PAYROLL_PERMISSIONS.export]}>
                  <Button
                    variant="outline"
                    isLoading={exportRun.isPending}
                    onClick={() =>
                      exportRun.mutate({ runId, month: run.month, format: 'excel' })
                    }
                    leftIcon={<FileSpreadsheet className="size-4" />}
                  >
                    Export
                  </Button>
                </Can>

                <Can permissions={[PAYROLL_PERMISSIONS.print]}>
                  <Button
                    variant="outline"
                    isLoading={downloadPayslips.isPending}
                    onClick={() => downloadPayslips.mutate({ runId, month: run.month })}
                    leftIcon={<Printer className="size-4" />}
                  >
                    All payslips
                  </Button>
                </Can>
              </>
            )}

            {canProcess && (
              <Can permissions={[PAYROLL_PERMISSIONS.update]}>
                <Button
                  onClick={processDialog.open}
                  leftIcon={<Calculator className="size-4" />}
                >
                  {run.status === 'draft' ? 'Process' : 'Re-process'}
                </Button>
              </Can>
            )}

            {canApprove && (
              <Can permissions={[PAYROLL_PERMISSIONS.approve]}>
                <Button onClick={approveDialog.open} leftIcon={<BadgeCheck className="size-4" />}>
                  Approve
                </Button>
              </Can>
            )}

            {canPay && (
              <Can permissions={[PAYROLL_PERMISSIONS.approve]}>
                <Button onClick={payDialog.open} leftIcon={<Wallet className="size-4" />}>
                  Mark paid
                </Button>
              </Can>
            )}
          </>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Status', RUN_STATUS_LABELS[run.status], null],
          ['Employees', String(run.employees_count), null],
          ['Gross', formatCurrency(run.gross_total), null],
          ['Deductions', formatCurrency(run.deductions_total), 'text-red-700'],
          ['Net payable', formatCurrency(run.net_total), 'text-emerald-700'],
        ].map(([label, value, tone], index) => (
          <Card key={label as string}>
            <CardBody>
              <p className="text-xs text-slate-500">{label}</p>
              {index === 0 ? (
                <Badge tone={RUN_STATUS_TONES[run.status]} withDot className="mt-1">
                  {value}
                </Badge>
              ) : (
                <p
                  className={cn(
                    'mt-0.5 font-mono text-lg font-semibold tabular-nums',
                    tone ?? 'text-slate-900',
                  )}
                >
                  {value}
                </p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {run.status === 'draft' && (
        <Alert tone="info" title="Not costed yet" className="mb-4">
          Processing reads every active salary, applies the month's attendance for loss of pay,
          and writes a payslip for each employee. The figures freeze at that point.
        </Alert>
      )}

      {run.payslips.length > 0 && (
        <Card className="mb-4">
          <CardHeader
            title="Statutory"
            description="What has to be remitted for this month."
          />
          <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['PF — employee', run.pf_employee_total],
              ['PF — employer', run.pf_employer_total],
              ['ESI — employee', run.esi_employee_total],
              ['ESI — employer', run.esi_employer_total],
            ].map(([label, amount]) => (
              <div key={label as string}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-slate-900">
                  {formatCurrency(amount as number)}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Payslips"
          description={
            run.payslips.length > 0
              ? `${run.payslips.length} employees`
              : 'None yet — process the run to generate them.'
          }
        />

        <CardBody className={run.payslips.length === 0 ? undefined : 'p-0'}>
          {run.payslips.length === 0 ? (
            <EmptyState
              icon={<Calculator className="size-6" />}
              title="Nothing costed yet"
              description="Process the run to work out what each employee is owed."
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                    <th scope="col" className="px-4 py-2 text-left">Employee</th>
                    <th scope="col" className="hidden px-3 py-2 text-right lg:table-cell">Days</th>
                    <th scope="col" className="px-3 py-2 text-right">Gross</th>
                    <th scope="col" className="hidden px-3 py-2 text-right md:table-cell">PF</th>
                    <th scope="col" className="hidden px-3 py-2 text-right xl:table-cell">ESI</th>
                    <th scope="col" className="px-3 py-2 text-right">Deductions</th>
                    <th scope="col" className="px-3 py-2 text-right">Net</th>
                    <th scope="col" className="px-4 py-2 text-right">
                      <span className="sr-only">Payslip</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {run.payslips.map((payslip) => (
                    <tr key={payslip.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={payslip.employee_name}
                            src={payslip.photo_url}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {payslip.employee_name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              <code>{payslip.employee_code}</code> · {payslip.designation}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="hidden px-3 py-2 text-right lg:table-cell">
                        <span
                          className={cn(
                            'text-sm',
                            payslip.lop_days > 0 ? 'font-medium text-red-700' : 'text-slate-700',
                          )}
                        >
                          {payslip.paid_days}/{payslip.working_days}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-right font-mono text-sm tabular-nums text-slate-700">
                        {formatCurrency(payslip.gross)}
                      </td>
                      <td className="hidden px-3 py-2 text-right font-mono text-sm tabular-nums text-slate-600 md:table-cell">
                        {payslip.pf_employee > 0 ? formatCurrency(payslip.pf_employee) : '—'}
                      </td>
                      <td className="hidden px-3 py-2 text-right font-mono text-sm tabular-nums text-slate-600 xl:table-cell">
                        {payslip.esi_employee > 0 ? formatCurrency(payslip.esi_employee) : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sm tabular-nums text-red-700">
                        {formatCurrency(payslip.total_deductions)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sm font-semibold tabular-nums text-slate-900">
                        {formatCurrency(payslip.net)}
                      </td>

                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(toPath(PATHS.payrollPayslip, { id: payslip.id }))
                          }
                        >
                          Payslip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        isOpen={processDialog.isOpen}
        onClose={processDialog.close}
        onConfirm={() =>
          processRun.mutate(runId, { onSuccess: () => processDialog.close() })
        }
        isLoading={processRun.isPending}
        title={run.status === 'draft' ? 'Process this payroll?' : 'Re-process this payroll?'}
        confirmLabel={run.status === 'draft' ? 'Process' : 'Re-process'}
        message={
          run.status === 'draft' ? (
            'Every active salary is costed against this month, and a payslip is written for each employee.'
          ) : (
            <Alert tone="warning">
              The existing payslips are discarded and rebuilt from the salaries as they stand
              now. This is only possible before approval.
            </Alert>
          )
        }
      />

      <ConfirmDialog
        isOpen={approveDialog.isOpen}
        onClose={approveDialog.close}
        onConfirm={() =>
          approveRun.mutate(
            { run_id: runId, remarks: '' },
            { onSuccess: () => approveDialog.close() },
          )
        }
        isLoading={approveRun.isPending}
        title="Approve this payroll?"
        confirmLabel="Approve"
        message={
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {formatCurrency(run.net_total)} across {run.employees_count} employees. After
              approval the figures cannot be re-processed — only paid.
            </p>
            <Alert tone="info">
              Approving and paying are separate steps, so the person who signs off need not be
              the person who releases the money.
            </Alert>
          </div>
        }
      />

      <ConfirmDialog
        isOpen={payDialog.isOpen}
        onClose={payDialog.close}
        onConfirm={() =>
          markPaid.mutate(
            { run_id: runId, paid_on: paidOn, reference },
            { onSuccess: () => payDialog.close() },
          )
        }
        isLoading={markPaid.isPending}
        title="Mark this payroll paid?"
        confirmLabel="Mark paid"
        message={
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {formatCurrency(run.net_total)} has left the bank. This closes the month for good.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="payroll-paid-on"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Paid on
                </label>
                <Input
                  id="payroll-paid-on"
                  type="date"
                  value={paidOn}
                  max={todayInputValue()}
                  onChange={(event) => setPaidOn(event.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="payroll-reference"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Reference
                </label>
                <Input
                  id="payroll-reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="NEFT batch 4471"
                />
              </div>
            </div>
          </div>
        }
      />
    </>
  );
}
