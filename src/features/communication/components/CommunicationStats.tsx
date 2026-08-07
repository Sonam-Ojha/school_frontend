import { Clock, MessageSquare, Pin, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

import { CHANNEL_LABELS, CHANNEL_STATUS_TONES } from '../constants';
import { useCommunicationSummary } from '../hooks/useCommunication';

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-lg bg-slate-100 p-2 text-slate-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={cn('truncate text-lg font-semibold', tone ?? 'text-slate-900')}>{value}</p>
      </div>
    </div>
  );
}

/**
 * The communication numbers, and which channels can actually send.
 *
 * A channel that is switched off gets its own banner rather than a badge in a
 * grid: somebody about to message nine hundred parents needs to know the SMS
 * gateway is down *before* they write the message, not after.
 */
export function CommunicationStats() {
  const { data, isLoading } = useCommunicationSummary();

  if (isLoading || !data) {
    return (
      <Card>
        <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardBody>
      </Card>
    );
  }

  const notReady = data.channels.filter((entry) => entry.status !== 'ready');

  return (
    <div className="space-y-4">
      {notReady.length === data.channels.length && (
        <Alert tone="danger" title="No channel can send">
          Nothing is configured. Set up SMTP or an SMS provider in{' '}
          <Link to={PATHS.settingsEmail} className="font-medium underline">
            school settings
          </Link>{' '}
          before composing anything.
        </Alert>
      )}

      {data.awaiting_approval > 0 && (
        <Alert
          tone="warning"
          title={`${data.awaiting_approval} notice${data.awaiting_approval === 1 ? '' : 's'} waiting for approval`}
        >
          They are not on the board until somebody publishes them.{' '}
          <Link to={PATHS.communicationNotices} className="font-medium underline">
            Review them
          </Link>
          .
        </Alert>
      )}

      <Card>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat
              icon={<MessageSquare className="size-4" />}
              label="Sent this month"
              value={formatNumber(data.sent_last_30_days)}
            />
            <Stat
              icon={<Clock className="size-4" />}
              label="Scheduled"
              value={formatNumber(data.scheduled)}
              tone={data.scheduled > 0 ? 'text-sky-700' : undefined}
            />
            <Stat
              icon={<Pin className="size-4" />}
              label="On the board"
              value={formatNumber(data.live_notices)}
            />
            <Stat
              icon={<TriangleAlert className="size-4" />}
              label="Awaiting approval"
              value={formatNumber(data.awaiting_approval)}
              tone={data.awaiting_approval > 0 ? 'text-amber-700' : undefined}
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {data.channels.map((entry) => (
              <Badge key={entry.channel} tone={CHANNEL_STATUS_TONES[entry.status]} withDot>
                {CHANNEL_LABELS[entry.channel]}
              </Badge>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
