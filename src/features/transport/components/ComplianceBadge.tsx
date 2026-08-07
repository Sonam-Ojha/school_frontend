import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

import { COMPLIANCE_LABELS, COMPLIANCE_TONES, DOCUMENT_LABELS } from '../constants';
import type { ComplianceStatus, VehicleDocument } from '../types';

/** The worst status across a bus's papers, for a table column. */
export function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  return (
    <Badge tone={COMPLIANCE_TONES[status]} withDot>
      {COMPLIANCE_LABELS[status]}
    </Badge>
  );
}

/**
 * The four statutory papers, with how long each has left.
 *
 * Days remaining rather than just the date: "expires 14 Sep" makes the reader
 * do the arithmetic, and the whole point of the panel is that somebody
 * notices in time.
 */
export function DocumentGrid({ documents }: { documents: VehicleDocument[] }) {
  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {documents.map((document) => (
        <div key={document.kind}>
          <dt className="text-xs text-slate-500">{DOCUMENT_LABELS[document.kind]}</dt>
          <dd className="mt-0.5 text-sm text-slate-900">
            {document.expires_on ? formatDate(document.expires_on) : '—'}
          </dd>
          <dd
            className={cn(
              'text-xs',
              document.status === 'expired'
                ? 'font-medium text-red-600'
                : document.status === 'expiring'
                  ? 'font-medium text-amber-700'
                  : 'text-slate-500',
            )}
          >
            {document.days_remaining === null
              ? 'Not recorded'
              : document.days_remaining < 0
                ? `Lapsed ${Math.abs(document.days_remaining)} days ago`
                : `${document.days_remaining} days left`}
          </dd>
        </div>
      ))}
    </dl>
  );
}
