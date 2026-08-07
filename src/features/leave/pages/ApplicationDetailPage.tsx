import {
  ArrowLeft,
  Check,
  CircleSlash,
  FileText,
  Undo2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatDate, formatDateTime } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { CancelModal } from '../components/CancelModal';
import { ReviewModal } from '../components/ReviewModal';
import {
  APPLICANT_TYPE_LABELS,
  DAY_PORTION_LABELS,
  LEAVE_PERMISSIONS,
  STATUS_LABELS,
  STATUS_TONES,
  canTransition,
} from '../constants';
import { useApplication, useBalance, useWithdrawApplication } from '../hooks/useLeave';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

/**
 * One application, and the approval workflow around it.
 *
 * Which buttons appear comes from `STATUS_TRANSITIONS` rather than a hand
 * written set of conditions, so the screen and the API cannot disagree about
 * what is still possible.
 */
export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canApprove = hasPermission(LEAVE_PERMISSIONS.approve);

  const { data: application, isLoading, error } = useApplication(id);
  const { data: balance } = useBalance(
    application?.applicant_type ?? null,
    application?.applicant_id ?? null,
  );
  const withdraw = useWithdrawApplication();

  const cancelModal = useDisclosure();
  const withdrawDialog = useDisclosure();
  const [reviewing, setReviewing] = useState<'approved' | 'rejected' | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load this application">
            {error?.message ?? 'It no longer exists.'}
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(PATHS.leaveApplications)}
          >
            Back to the register
          </Button>
        </CardBody>
      </Card>
    );
  }

  const entitlement = balance?.entitlements.find(
    (entry) => entry.leave_type_id === application.leave_type_id,
  );

  const canDecide = canApprove && canTransition(application.status, 'approved');
  const canCancel =
    canApprove && canTransition(application.status, 'cancelled') && !application.has_started;
  const canWithdraw = canTransition(application.status, 'withdrawn');

  return (
    <>
      <PageHeader
        title={application.applicant_name}
        description={`${application.leave_type_name} · ${application.days} day${application.days === 1 ? '' : 's'}`}
        breadcrumbs={[
          { label: 'Leave', to: PATHS.leaveApplications },
          { label: application.applicant_name },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(PATHS.leaveApplications)}
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Back
            </Button>

            {canWithdraw && (
              <Can permissions={[LEAVE_PERMISSIONS.update]}>
                <Button
                  variant="outline"
                  onClick={withdrawDialog.open}
                  leftIcon={<Undo2 className="size-4" />}
                >
                  Withdraw
                </Button>
              </Can>
            )}

            {canCancel && (
              <Button
                variant="outline"
                onClick={cancelModal.open}
                leftIcon={<CircleSlash className="size-4" />}
              >
                Undo approval
              </Button>
            )}

            {canDecide && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setReviewing('rejected')}
                  leftIcon={<X className="size-4" />}
                >
                  Refuse
                </Button>
                <Button
                  onClick={() => setReviewing('approved')}
                  leftIcon={<Check className="size-4" />}
                >
                  Approve
                </Button>
              </>
            )}
          </>
        }
      />

      {application.status === 'pending' && application.has_started && (
        <Alert tone="danger" title="This leave has already begun" className="mb-4">
          The first day was {formatDate(application.from_date)} and nobody has decided. Until
          somebody does, {application.applicant_name} is absent without permission on the record.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="The request"
              actions={
                <Badge tone={STATUS_TONES[application.status]} withDot>
                  {STATUS_LABELS[application.status]}
                </Badge>
              }
            />
            <CardBody className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar
                  name={application.applicant_name}
                  src={application.photo_url}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{application.applicant_name}</p>
                  <p className="text-sm text-slate-500">
                    {APPLICANT_TYPE_LABELS[application.applicant_type]} ·{' '}
                    <code>{application.applicant_identifier}</code>
                  </p>
                  {application.applicant_detail && (
                    <p className="text-sm text-slate-500">{application.applicant_detail}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <Field
                  label="From"
                  value={
                    <>
                      {formatDate(application.from_date)}
                      {application.day_portion !== 'full' && (
                        <span className="block text-xs font-normal text-slate-500">
                          {DAY_PORTION_LABELS[application.day_portion]}
                        </span>
                      )}
                    </>
                  }
                />
                <Field label="To" value={formatDate(application.to_date)} />
                <Field
                  label="Working days"
                  value={
                    <>
                      {application.days}
                      <span className="block text-xs font-normal text-slate-500">
                        holidays and weekends excluded
                      </span>
                    </>
                  }
                />
                <Field
                  label="Type"
                  value={
                    <>
                      {application.leave_type_name}
                      <span className="block text-xs font-normal text-slate-500">
                        {application.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </>
                  }
                />
                <Field label="Filed" value={formatDateTime(application.applied_at)} />
                <Field label="Filed by" value={application.applied_by ?? 'The applicant'} />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">Reason</p>
                <p className="mt-1 text-sm whitespace-pre-wrap text-slate-800">
                  {application.reason}
                </p>
              </div>

              {application.document_name && (
                <p className="flex items-center gap-1.5 text-sm text-slate-600">
                  <FileText className="size-4 text-slate-400" />
                  <code>{application.document_name}</code>
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="What happened"
              description="Every step, so a decision can be accounted for months later."
            />
            <CardBody>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-slate-300" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Applied</p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(application.applied_at)}
                      {application.applied_by ? ` · ${application.applied_by}` : ''}
                    </p>
                  </div>
                </li>

                {application.reviewed_at ? (
                  <li className="flex gap-3">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        application.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {STATUS_LABELS[application.status]}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(application.reviewed_at)}
                        {application.reviewed_by ? ` · ${application.reviewed_by}` : ''}
                      </p>
                      {application.review_note && (
                        <p className="mt-1 text-sm text-slate-700">{application.review_note}</p>
                      )}
                    </div>
                  </li>
                ) : (
                  <li className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Awaiting a decision</p>
                      <p className="text-xs text-slate-500">
                        {canDecide
                          ? 'Yours to make.'
                          : 'Somebody with the approval right has to decide.'}
                      </p>
                    </div>
                  </li>
                )}
              </ol>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Their balance" />
            <CardBody className="space-y-3">
              {balance ? (
                balance.entitlements.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No leave type with a quota applies to a{' '}
                    {APPLICANT_TYPE_LABELS[application.applicant_type].toLowerCase()} — requests
                    are judged on the reason instead.
                  </p>
                ) : (
                  balance.entitlements.map((entry) => (
                    <div
                      key={entry.leave_type_id}
                      className={`rounded-lg border p-2.5 ${
                        entry.leave_type_id === application.leave_type_id
                          ? 'border-brand-200 bg-brand-50/50'
                          : 'border-slate-200'
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900">{entry.leave_type_name}</p>
                      {entry.quota === null ? (
                        <p className="text-xs text-slate-500">
                          No quota · {entry.taken} taken so far
                        </p>
                      ) : (
                        <>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-brand-500"
                              style={{
                                width: `${Math.min(100, ((entry.taken + entry.pending) / entry.quota) * 100)}%`,
                              }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {entry.available} of {entry.quota} left
                            {entry.pending > 0 && ` · ${entry.pending} awaiting`}
                          </p>
                        </>
                      )}
                    </div>
                  ))
                )
              ) : (
                <Skeleton className="h-24 w-full" />
              )}
            </CardBody>
          </Card>

          {entitlement?.available !== null &&
            entitlement !== undefined &&
            application.status === 'pending' &&
            application.days > (entitlement.available ?? 0) && (
              <Alert tone="warning" title="Past their entitlement">
                This request is for {application.days} days and only {entitlement.available}{' '}
                remain. Approving it is a decision to go over.
              </Alert>
            )}

          {application.status === 'approved' && (
            <Alert tone="info" title="On the attendance sheet">
              These days are locked as leave. Nobody can mark{' '}
              {application.applicant_name.split(' ')[0]} present or absent on them until the
              approval is undone.
            </Alert>
          )}
        </div>
      </div>

      {reviewing && (
        <ReviewModal
          key={reviewing}
          isOpen
          onClose={() => setReviewing(null)}
          application={application}
          decision={reviewing}
        />
      )}

      {cancelModal.isOpen && (
        <CancelModal
          isOpen={cancelModal.isOpen}
          onClose={cancelModal.close}
          application={application}
        />
      )}

      <ConfirmDialog
        isOpen={withdrawDialog.isOpen}
        onClose={withdrawDialog.close}
        onConfirm={() =>
          withdraw.mutate(application.id, { onSuccess: withdrawDialog.close })
        }
        isLoading={withdraw.isPending}
        isDestructive
        title="Withdraw this application?"
        confirmLabel="Withdraw"
        message="It comes off the approval queue and the days go back on the balance. The record is kept — a withdrawal is not a deletion."
      />
    </>
  );
}
