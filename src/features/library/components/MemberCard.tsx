import { BookOpen, Clock, IndianRupee } from 'lucide-react';
import type { ReactNode } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';

import { MEMBER_TYPE_LABELS } from '../constants';
import type { LibraryMember } from '../types';

interface MemberCardProps {
  member: LibraryMember;
  className?: string;
}

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
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={cn('text-sm font-semibold', tone ?? 'text-slate-900')}>{value}</p>
      </div>
    </div>
  );
}

/**
 * A borrower at the desk.
 *
 * Leads with whether they may take another book, because that is the only
 * question being asked — the loan count and the fine are the evidence for the
 * answer, not the answer.
 */
export function MemberCard({ member, className }: MemberCardProps) {
  const headroom = member.borrow_limit - member.active_loans;

  return (
    <Card className={className}>
      <CardBody className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar name={member.name} src={member.photo_url} size="lg" />

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{member.name}</p>
            <p className="truncate text-xs text-slate-500">
              <code>{member.identifier}</code>
              {member.detail ? ` · ${member.detail}` : ''}
            </p>
            <Badge tone="neutral" className="mt-1.5">
              {MEMBER_TYPE_LABELS[member.member_type]}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat
            icon={<BookOpen className="size-4" />}
            label="On loan"
            value={`${member.active_loans} of ${member.borrow_limit}`}
            tone={headroom <= 0 ? 'text-amber-700' : undefined}
          />
          <Stat
            icon={<Clock className="size-4" />}
            label="Overdue"
            value={String(member.overdue_loans)}
            tone={member.overdue_loans > 0 ? 'text-red-700' : undefined}
          />
          <Stat
            icon={<IndianRupee className="size-4" />}
            label="Fines due"
            value={formatCurrency(member.outstanding_fine)}
            tone={member.outstanding_fine > 0 ? 'text-red-700' : undefined}
          />
        </div>

        {member.can_borrow ? (
          <Alert tone="success">
            May borrow {headroom} more book{headroom === 1 ? '' : 's'}.
          </Alert>
        ) : (
          <Alert tone="danger" title="Cannot borrow">
            {member.blocked_reason}
          </Alert>
        )}
      </CardBody>
    </Card>
  );
}
