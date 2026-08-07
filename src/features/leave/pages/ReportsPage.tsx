import { FileSpreadsheet, FileText, UserMinus } from 'lucide-react';
import { useMemo } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, todayInputValue } from '@/lib/format';
import { useQueryParams } from '@/hooks/useQueryParams';

import {
  APPLICANT_TYPE_LABELS,
  APPLICANT_TYPE_OPTIONS,
  DAY_PORTION_LABELS,
  LEAVE_PERMISSIONS,
} from '../constants';
import { useAwayToday, useExportReport, useLeaveReport } from '../hooks/useLeave';
import type { ApplicantType } from '../types';

/** First of the current month through today — the range somebody usually wants. */
const defaultFrom = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const today = () => todayInputValue();

/**
 * Leave reports.
 *
 * Two questions, and they are not the same one. *Who is away right now* is
 * asked every morning and has to be answered in a glance; *how much leave has
 * been taken* is asked once a term and wants a grid. Both live here rather
 * than the second one being buried under an export button.
 */
export default function ReportsPage() {
  const { searchParams, patch } = useQueryParams();

  const from = searchParams.get('from') ?? defaultFrom();
  const to = searchParams.get('to') ?? today();
  const applicantType = (searchParams.get('applicant_type') as ApplicantType | null) ?? null;


  const query = useMemo(() => ({ from, to, applicantType }), [from, to, applicantType]);

  const { data: report, isLoading, error } = useLeaveReport(query, to >= from);
  const { data: away, isLoading: awayLoading } = useAwayToday(applicantType);
  const exportReport = useExportReport();

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label htmlFor="leave-from" className="mb-1.5 block text-sm font-medium text-slate-700">
              From
            </label>
            <Input
              id="leave-from"
              type="date"
              value={from}
              max={to}
              onChange={(event) => patch({ from: event.target.value })}
            />
          </div>

          <div>
            <label htmlFor="leave-to" className="mb-1.5 block text-sm font-medium text-slate-700">
              To
            </label>
            <Input
              id="leave-to"
              type="date"
              value={to}
              min={from}
              onChange={(event) => patch({ to: event.target.value })}
            />
          </div>

          <div>
            <label htmlFor="leave-who" className="mb-1.5 block text-sm font-medium text-slate-700">
              Population
            </label>
            <Select
              id="leave-who"
              value={applicantType ?? ''}
              options={APPLICANT_TYPE_OPTIONS}
              placeholder="Everybody"
              onChange={(event) => patch({ applicant_type: event.target.value || undefined })}
              className="w-40"
            />
          </div>

          <Can permissions={[LEAVE_PERMISSIONS.export]}>
            <div className="flex items-end gap-2 sm:ml-auto">
              <Button
                variant="outline"
                isLoading={exportReport.isPending}
                onClick={() => exportReport.mutate({ query, format: 'excel' })}
                leftIcon={<FileSpreadsheet className="size-4" />}
              >
                Excel
              </Button>
              <Button
                variant="outline"
                isLoading={exportReport.isPending}
                onClick={() => exportReport.mutate({ query, format: 'pdf' })}
                leftIcon={<FileText className="size-4" />}
              >
                PDF
              </Button>
            </div>
          </Can>
        </CardBody>
      </Card>

      {/* Away today — the question a school actually asks each morning. */}
      <Card>
        <CardHeader
          title="Away today"
          description={
            away && away.length > 0
              ? `${away.length} on approved leave right now`
              : 'Nobody is on approved leave today.'
          }
        />
        <CardBody>
          {awayLoading ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : away && away.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {away.map((person) => (
                <div
                  key={person.application_id}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5"
                >
                  <Avatar name={person.applicant_name} src={person.photo_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {person.applicant_name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {person.leave_type_name}
                      {person.day_portion !== 'full' &&
                        ` · ${DAY_PORTION_LABELS[person.day_portion].toLowerCase()}`}
                    </p>
                  </div>
                  <Badge tone={person.days_remaining > 1 ? 'info' : 'neutral'}>
                    {person.days_remaining === 1
                      ? 'back tomorrow'
                      : `${person.days_remaining} days`}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Everybody is in.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Leave taken"
          description={`${formatDate(from)} to ${formatDate(to)}${
            applicantType ? ` · ${APPLICANT_TYPE_LABELS[applicantType].toLowerCase()} only` : ''
          }`}
          actions={
            report && (
              <div className="hidden gap-2 sm:flex">
                <Badge tone="neutral">{report.totals.people} people</Badge>
                <Badge tone="info">{report.totals.days} days</Badge>
                {report.totals.unpaid_days > 0 && (
                  <Badge tone="warning">{report.totals.unpaid_days} unpaid</Badge>
                )}
              </div>
            )
          }
        />

        <CardBody className="p-0">
          {to < from ? (
            <div className="p-4 sm:p-6">
              <Alert tone="warning" title="That range runs backwards">
                The end date is before the start date.
              </Alert>
            </div>
          ) : error ? (
            <div className="p-4 sm:p-6">
              <Alert tone="danger" title="Could not load the report">
                {error.message}
              </Alert>
            </div>
          ) : isLoading ? (
            <div className="space-y-2 p-4 sm:p-6">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          ) : !report || report.rows.length === 0 ? (
            <div className="p-4 sm:p-6">
              <EmptyState
                icon={<UserMinus className="size-6" />}
                title="No leave in this range"
                description="Nobody was granted leave between these dates."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="sticky left-0 bg-slate-50 px-4 py-2.5 font-medium text-slate-600">
                      Person
                    </th>
                    {report.columns.map((column) => (
                      <th
                        key={column.code}
                        className="px-3 py-2.5 text-center font-medium text-slate-600"
                        title={column.name}
                      >
                        {column.code}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-right font-medium text-slate-600">Days</th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-600">Unpaid</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {report.rows.map((row) => (
                    <tr key={`${row.applicant_type}-${row.applicant_id}`} className="hover:bg-slate-50">
                      <td className="sticky left-0 bg-white px-4 py-2.5 hover:bg-slate-50">
                        <p className="font-medium text-slate-900">{row.applicant_name}</p>
                        <p className="text-xs text-slate-500">
                          {APPLICANT_TYPE_LABELS[row.applicant_type]}
                          {row.applicant_detail ? ` · ${row.applicant_detail}` : ''}
                        </p>
                      </td>
                      {report.columns.map((column) => (
                        <td
                          key={column.code}
                          className={`px-3 py-2.5 text-center ${
                            row.by_type[column.code] ? 'text-slate-800' : 'text-slate-300'
                          }`}
                        >
                          {row.by_type[column.code] ?? 0}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-900">
                        {row.total_days}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {row.unpaid_days > 0 ? (
                          <span className="text-amber-700">{row.unpaid_days}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                  <tr>
                    <td className="sticky left-0 bg-slate-50 px-4 py-2.5 text-slate-700">
                      {report.totals.people} people · {report.totals.applications} applications
                    </td>
                    {report.columns.map((column) => (
                      <td key={column.code} className="px-3 py-2.5 text-center text-slate-700">
                        {report.totals.by_type[column.code] ?? 0}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-right text-slate-900">
                      {report.totals.days}
                    </td>
                    <td className="px-4 py-2.5 text-right text-amber-700">
                      {report.totals.unpaid_days || '—'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
