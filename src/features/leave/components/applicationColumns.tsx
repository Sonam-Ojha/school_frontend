import { Check, X } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

import {
  APPLICANT_TYPE_LABELS,
  DAY_PORTION_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
  canTransition,
} from '../constants';
import type { LeaveApplication } from '../types';

interface ApplicationColumnOptions {
  onReview: (application: LeaveApplication, decision: 'approved' | 'rejected') => void;
  canApprove: boolean;
}

/** The dates, compressed — a one-day leave should not read like a range. */
function renderWhen(application: LeaveApplication) {
  const single = application.from_date === application.to_date;

  return (
    <div className="min-w-0">
      <p className="text-sm whitespace-nowrap text-slate-800">
        {formatDate(application.from_date)}
        {!single && ` – ${formatDate(application.to_date)}`}
      </p>
      <p className="text-xs whitespace-nowrap text-slate-500">
        {application.days} day{application.days === 1 ? '' : 's'}
        {application.day_portion !== 'full' &&
          ` · ${DAY_PORTION_LABELS[application.day_portion].toLowerCase()}`}
      </p>
    </div>
  );
}

export function buildApplicationColumns({
  onReview,
  canApprove,
}: ApplicationColumnOptions): Column<LeaveApplication>[] {
  return [
    {
      key: 'applicant_name',
      header: 'Applicant',
      sortable: true,
      cell: (application) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            name={application.applicant_name}
            src={application.photo_url}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{application.applicant_name}</p>
            <p className="truncate text-xs text-slate-500">
              {APPLICANT_TYPE_LABELS[application.applicant_type]}
              {application.applicant_detail ? ` · ${application.applicant_detail}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'leave_type_name',
      header: 'Type',
      sortable: true,
      hideBelow: 'md',
      cell: (application) => (
        <div>
          <p className="text-sm text-slate-800">{application.leave_type_name}</p>
          <p className="text-xs text-slate-500">
            {application.is_paid ? 'Paid' : 'Unpaid'}
            {application.document_name ? ' · document attached' : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'from_date',
      header: 'Dates',
      sortable: true,
      cell: renderWhen,
    },
    {
      key: 'reason',
      header: 'Reason',
      hideBelow: 'lg',
      cell: (application) => (
        <p className="line-clamp-2 max-w-xs text-sm text-slate-600">{application.reason}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (application) => (
        <div className="space-y-1">
          <Badge tone={STATUS_TONES[application.status]} withDot>
            {STATUS_LABELS[application.status]}
          </Badge>
          {/*
            A request nobody has decided on whose leave has already begun is the
            one row worth shouting about: somebody is either absent without
            permission or at work when they expected not to be.
          */}
          {application.status === 'pending' && application.has_started && (
            <p className="text-xs font-medium text-red-600">First day has passed</p>
          )}
          {application.status === 'approved' && application.is_current && (
            <p className="text-xs text-emerald-700">Away now</p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Decision</span>,
      align: 'right',
      width: '1%',
      cell: (application) => {
        if (!canApprove || !canTransition(application.status, 'approved')) {
          return (
            <span
              className={cn(
                'text-xs whitespace-nowrap',
                application.reviewed_by ? 'text-slate-500' : 'text-slate-300',
              )}
            >
              {application.reviewed_by ? `by ${application.reviewed_by}` : '—'}
            </span>
          );
        }

        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Approve leave for ${application.applicant_name}`}
              title="Approve"
              onClick={(event) => {
                event.stopPropagation();
                onReview(application, 'approved');
              }}
            >
              <Check className="size-4 text-emerald-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Refuse leave for ${application.applicant_name}`}
              title="Refuse"
              onClick={(event) => {
                event.stopPropagation();
                onReview(application, 'rejected');
              }}
            >
              <X className="size-4 text-red-600" />
            </Button>
          </div>
        );
      },
    },
  ];
}
