import { ArrowLeft, Ban } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { formatDateTime, formatNumber } from '@/lib/format';

import {
  CHANNEL_LABELS,
  COMMUNICATION_PERMISSIONS,
  EDITABLE_STATUSES,
  MESSAGE_STATUS_LABELS,
  MESSAGE_STATUS_TONES,
} from '../constants';
import { useCancelMessage, useMessage } from '../hooks/useCommunication';

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: message, isLoading, error } = useMessage(id);
  const cancelMessage = useCancelMessage();
  const cancelDialog = useDisclosure();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !message) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load this message">
            {error?.message ?? 'It no longer exists.'}
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(PATHS.communicationMessages)}
          >
            Back to messages
          </Button>
        </CardBody>
      </Card>
    );
  }

  const isSettled = !EDITABLE_STATUSES.includes(message.status);

  return (
    <>
      <PageHeader
        title={message.subject}
        description={
          message.sent_at
            ? `Sent ${formatDateTime(message.sent_at)} by ${message.created_by ?? 'the system'}`
            : message.scheduled_at
              ? `Scheduled for ${formatDateTime(message.scheduled_at)}`
              : 'Not sent'
        }
        breadcrumbs={[
          { label: 'Communication', to: PATHS.communicationMessages },
          { label: message.subject },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(PATHS.communicationMessages)}
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Back
            </Button>

            {!isSettled && (
              <Can permissions={[COMMUNICATION_PERMISSIONS.send]}>
                <Button
                  variant="danger"
                  onClick={cancelDialog.open}
                  leftIcon={<Ban className="size-4" />}
                >
                  Cancel
                </Button>
              </Can>
            )}
          </>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        {[
          ['Status', MESSAGE_STATUS_LABELS[message.status], true],
          ['Recipients', formatNumber(message.recipients_count), false],
          ['Delivered', formatNumber(message.total_delivered), false],
          ['Failed', formatNumber(message.total_failed), false],
        ].map(([label, value, isBadge], index) => (
          <Card key={label as string}>
            <CardBody>
              <p className="text-xs text-slate-500">{label}</p>
              {isBadge ? (
                <Badge tone={MESSAGE_STATUS_TONES[message.status]} withDot className="mt-1">
                  {value}
                </Badge>
              ) : (
                <p
                  className={cn(
                    'mt-0.5 text-lg font-semibold',
                    index === 3 && message.total_failed > 0
                      ? 'text-red-700'
                      : 'text-slate-900',
                  )}
                >
                  {value}
                </p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {message.status === 'partial' && (
        <Alert tone="warning" title="Some channels did not go out" className="mb-4">
          The breakdown below says which. The people it did reach were reached — resending would
          message them twice.
        </Alert>
      )}

      {message.notice_id && (
        <Alert tone="info" className="mb-4">
          This was announced from a notice.{' '}
          <button
            type="button"
            className="font-medium underline"
            onClick={() =>
              navigate(toPath(PATHS.communicationNoticeDetail, { id: message.notice_id! }))
            }
          >
            Open the notice
          </button>
          .
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="What was sent" description={message.audience_label} />
          <CardBody>
            <p className="text-sm whitespace-pre-wrap text-slate-800">{message.body}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Channels" />
          <CardBody className="space-y-4">
            {message.deliveries.map((delivery) => (
              <div key={delivery.channel} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">
                    {CHANNEL_LABELS[delivery.channel]}
                  </p>
                  {delivery.error ? (
                    <Badge tone="danger">Failed</Badge>
                  ) : (
                    <Badge tone="success">
                      {formatNumber(delivery.delivered)}/{formatNumber(delivery.targeted)}
                    </Badge>
                  )}
                </div>

                <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Sent</dt>
                    <dd className="tabular-nums">{formatNumber(delivery.sent)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Failed</dt>
                    <dd
                      className={cn(
                        'tabular-nums',
                        delivery.failed > 0 && 'font-medium text-red-600',
                      )}
                    >
                      {formatNumber(delivery.failed)}
                    </dd>
                  </div>

                  {delivery.read !== null && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Read</dt>
                      <dd className="tabular-nums">{formatNumber(delivery.read)}</dd>
                    </div>
                  )}

                  {delivery.segments !== null && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Segments</dt>
                      <dd className="tabular-nums">{formatNumber(delivery.segments)}</dd>
                    </div>
                  )}
                </dl>

                {delivery.error && (
                  <p className="mt-1.5 text-xs text-red-600">{delivery.error}</p>
                )}
              </div>
            ))}

            {message.deliveries.length === 0 && (
              <p className="text-sm text-slate-500">Nothing has gone out yet.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        onClose={cancelDialog.close}
        onConfirm={() =>
          cancelMessage.mutate(message.id, { onSuccess: () => cancelDialog.close() })
        }
        isLoading={cancelMessage.isPending}
        isDestructive
        title="Cancel this message?"
        confirmLabel="Cancel it"
        cancelLabel="Leave it queued"
        message={`It reaches ${formatNumber(message.recipients_count)} people. Cancelling stops it going out at all.`}
      />
    </>
  );
}
