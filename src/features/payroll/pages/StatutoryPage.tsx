import { FileSpreadsheet, Landmark } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/format';

import { PAYROLL_PERMISSIONS, RUN_STATUS_LABELS, RUN_STATUS_TONES } from '../constants';
import { useExportRegister, useStatutoryRegister } from '../hooks/usePayroll';
import {
  ESI_RATE_EMPLOYEE,
  ESI_RATE_EMPLOYER,
  ESI_WAGE_CEILING,
  PF_RATE_EMPLOYEE,
  PF_WAGE_CEILING,
} from '../statutory';

function lastMonth(): string {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
}

/**
 * The PF and ESI registers.
 *
 * Derived from the month's payslips rather than recomputed — the return a
 * school files has to match what it actually paid, and two calculations of
 * the same month is one too many. A month with no processed run has no
 * register, which is a truthful answer rather than an empty table.
 */
export default function StatutoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const month = searchParams.get('month') || lastMonth();

  const { data: register, isLoading, error } = useStatutoryRegister(month);
  const exportRegister = useExportRegister();

  const setMonth = (value: string) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set('month', value);
        else next.delete('month');
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="space-y-4">
      <Card className="print-hidden">
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label
              htmlFor="statutory-month"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Month
            </label>
            <Input
              id="statutory-month"
              type="month"
              value={month}
              max={new Date().toISOString().slice(0, 7)}
              onChange={(event) => setMonth(event.target.value)}
              className="w-48"
            />
          </div>

          {register?.run_status && (
            <div className="sm:mb-2">
              <Badge tone={RUN_STATUS_TONES[register.run_status]} withDot>
                Payroll {RUN_STATUS_LABELS[register.run_status].toLowerCase()}
              </Badge>
            </div>
          )}

          {register && register.pf.rows.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <Can permissions={[PAYROLL_PERMISSIONS.export]}>
                <Button
                  variant="outline"
                  isLoading={exportRegister.isPending}
                  onClick={() => exportRegister.mutate({ month, scheme: 'pf' })}
                  leftIcon={<FileSpreadsheet className="size-4" />}
                >
                  PF return
                </Button>
                <Button
                  variant="outline"
                  isLoading={exportRegister.isPending}
                  onClick={() => exportRegister.mutate({ month, scheme: 'esi' })}
                  leftIcon={<FileSpreadsheet className="size-4" />}
                >
                  ESI return
                </Button>
              </Can>
            </div>
          )}
        </CardBody>
      </Card>

      {error ? (
        <Alert tone="danger" title="Could not load the register">
          {error.message}
        </Alert>
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !register || register.run_id === null ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Landmark className="size-6" />}
              title="No payroll processed for this month"
              description="The registers are built from the payslips, so there is nothing to file until the month has been run."
            />
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader
              title="Provident Fund"
              description={`Employee ${PF_RATE_EMPLOYEE}% of PF wages, capped at ${formatCurrency(PF_WAGE_CEILING)} unless the school contributes on the full wage.`}
            />

            <CardBody className={register.pf.rows.length === 0 ? undefined : 'p-0'}>
              {register.pf.rows.length === 0 ? (
                <p className="text-sm text-slate-500">Nobody attracted PF this month.</p>
              ) : (
                <div className="scrollbar-thin overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                        <th scope="col" className="px-4 py-2 text-left">Employee</th>
                        <th scope="col" className="hidden px-3 py-2 text-left md:table-cell">UAN</th>
                        <th scope="col" className="px-3 py-2 text-right">PF wages</th>
                        <th scope="col" className="px-3 py-2 text-right">Employee</th>
                        <th scope="col" className="hidden px-3 py-2 text-right lg:table-cell">Employer</th>
                        <th scope="col" className="hidden px-3 py-2 text-right lg:table-cell">Pension</th>
                        <th scope="col" className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {register.pf.rows.map((row) => (
                        <tr
                          key={row.employee_id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-4 py-2">
                            <p className="truncate font-medium text-slate-900">
                              {row.employee_name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              <code>{row.employee_code}</code>
                            </p>
                          </td>
                          <td className="hidden px-3 py-2 md:table-cell">
                            {row.uan ? (
                              <code className="text-xs text-slate-600">{row.uan}</code>
                            ) : (
                              <span className="text-xs text-red-600">Not recorded</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-sm tabular-nums text-slate-700">
                            {formatCurrency(row.pf_wages)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-sm tabular-nums text-slate-700">
                            {formatCurrency(row.employee_share)}
                          </td>
                          <td className="hidden px-3 py-2 text-right font-mono text-sm tabular-nums text-slate-600 lg:table-cell">
                            {formatCurrency(row.employer_share)}
                          </td>
                          <td className="hidden px-3 py-2 text-right font-mono text-sm tabular-nums text-slate-600 lg:table-cell">
                            {formatCurrency(row.pension_share)}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-sm font-semibold tabular-nums text-slate-900">
                            {formatCurrency(row.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                        <td className="px-4 py-2" colSpan={2}>
                          {register.pf.rows.length} members
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {formatCurrency(register.pf.wages)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {formatCurrency(register.pf.employee_total)}
                        </td>
                        <td className="hidden px-3 py-2 text-right font-mono tabular-nums lg:table-cell">
                          {formatCurrency(register.pf.employer_total)}
                        </td>
                        <td className="hidden px-3 py-2 text-right font-mono tabular-nums lg:table-cell">
                          {formatCurrency(register.pf.pension_total)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono tabular-nums">
                          {formatCurrency(register.pf.grand_total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Employees' State Insurance"
              description={`Employee ${ESI_RATE_EMPLOYEE}%, employer ${ESI_RATE_EMPLOYER}%, for anybody grossing up to ${formatCurrency(ESI_WAGE_CEILING)} a month.`}
            />

            <CardBody className={register.esi.rows.length === 0 ? undefined : 'p-0'}>
              {register.esi.rows.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nobody was inside the ESI ceiling this month.
                </p>
              ) : (
                <div className="scrollbar-thin overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                        <th scope="col" className="px-4 py-2 text-left">Employee</th>
                        <th scope="col" className="hidden px-3 py-2 text-left md:table-cell">ESI number</th>
                        <th scope="col" className="px-3 py-2 text-right">ESI wages</th>
                        <th scope="col" className="px-3 py-2 text-right">Employee</th>
                        <th scope="col" className="px-3 py-2 text-right">Employer</th>
                        <th scope="col" className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {register.esi.rows.map((row) => (
                        <tr
                          key={row.employee_id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-4 py-2">
                            <p className="truncate font-medium text-slate-900">
                              {row.employee_name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              <code>{row.employee_code}</code>
                            </p>
                          </td>
                          <td className="hidden px-3 py-2 md:table-cell">
                            {row.esi_number ? (
                              <code className="text-xs text-slate-600">{row.esi_number}</code>
                            ) : (
                              <span className="text-xs text-red-600">Not recorded</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-sm tabular-nums text-slate-700">
                            {formatCurrency(row.esi_wages)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-sm tabular-nums text-slate-700">
                            {formatCurrency(row.employee_share)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-sm tabular-nums text-slate-600">
                            {formatCurrency(row.employer_share)}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-sm font-semibold tabular-nums text-slate-900">
                            {formatCurrency(row.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                        <td className="px-4 py-2" colSpan={2}>
                          {register.esi.rows.length} members
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {formatCurrency(register.esi.wages)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {formatCurrency(register.esi.employee_total)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {formatCurrency(register.esi.employer_total)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono tabular-nums">
                          {formatCurrency(register.esi.grand_total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
