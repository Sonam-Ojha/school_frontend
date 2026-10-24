import { useQuery } from '@tanstack/react-query';
import { History, KeyRound, ShieldCheck, UserCog, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDateTime } from '@/lib/format';
import { relativeTime } from '@/lib/relativeTime';
import type { ToneName } from '@/types/common';

import { accessLogService, type AccessLogAction, type AccessLogEntry } from '../services/accessLogService';

const ACTIONS: Record<AccessLogAction, { label: string; tone: ToneName; icon: LucideIcon }> = {
  'role.created': { label: 'Role created', tone: 'success', icon: ShieldCheck },
  'role.updated': { label: 'Role changed', tone: 'info', icon: ShieldCheck },
  'role.deleted': { label: 'Role deleted', tone: 'danger', icon: ShieldCheck },
  'user.created': { label: 'Account created', tone: 'success', icon: UserCog },
  'user.updated': { label: 'Account changed', tone: 'neutral', icon: UserCog },
  'user.deleted': { label: 'Account deleted', tone: 'danger', icon: UserCog },
  'user.roles': { label: 'Roles changed', tone: 'info', icon: UserCog },
  'user.permissions': { label: 'Permission override', tone: 'warning', icon: KeyRound },
  'user.scope': { label: 'Access scope', tone: 'warning', icon: KeyRound },
  'user.status': { label: 'Sign-in allowed / blocked', tone: 'neutral', icon: UserCog },
};

const KIND_OPTIONS = [
  { label: 'Every change', value: '' },
  { label: 'Roles', value: 'role' },
  { label: 'Accounts', value: 'user' },
  { label: 'Overrides & scope', value: 'override' },
];

function matchesKind(entry: AccessLogEntry, kind: string): boolean {
  if (!kind) return true;
  if (kind === 'override') return entry.action === 'user.permissions' || entry.action === 'user.scope';
  return entry.action.startsWith(`${kind}.`);
}

const columns: Column<AccessLogEntry>[] = [
  {
    key: 'at',
    header: 'When',
    width: '11rem',
    cell: (entry) => (
      <div>
        <p className="text-slate-900">{relativeTime(entry.at)}</p>
        <p className="text-xs text-slate-500">{formatDateTime(entry.at)}</p>
      </div>
    ),
  },
  {
    key: 'action',
    header: 'Change',
    cell: (entry) => {
      const action = ACTIONS[entry.action] ?? { label: entry.action, tone: 'neutral' as const, icon: History };
      return <Badge tone={action.tone}>{action.label}</Badge>;
    },
  },
  {
    key: 'target',
    header: 'About',
    cell: (entry) => <span className="font-medium text-slate-900">{entry.target}</span>,
  },
  {
    key: 'detail',
    header: 'What changed',
    hideBelow: 'md',
    cell: (entry) => <p className="max-w-xl text-sm whitespace-pre-line text-slate-600">{entry.detail}</p>,
  },
  {
    key: 'actor',
    header: 'By',
    hideBelow: 'sm',
    cell: (entry) => <span className="text-slate-700">{entry.actor_name}</span>,
  },
];

/**
 * Every change to who may do what — roles and their permissions, a person's
 * roles, personal overrides, access scope and sign-in status — with who made
 * it and when. Written by the server as each change is saved; nobody can edit it.
 */
export default function AccessLogPage() {
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const debounced = useDebounce(search.trim());

  const log = useQuery({
    queryKey: ['access-log', debounced],
    queryFn: ({ signal }) => accessLogService.list(debounced, signal),
    placeholderData: (previous) => previous,
  });

  const rows = useMemo(() => (log.data ?? []).filter((entry) => matchesKind(entry, kind)), [log.data, kind]);

  return (
    <>
      <PageHeader
        title="Access log"
        description="Every change to roles, permissions, personal overrides, access scope and accounts — who made it, and when."
      />

      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={log.isPending}
          isFetching={log.isFetching && !log.isPending}
          error={log.error}
          toolbar={
            <TableToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search by person, role or change…"
              filters={
                <Select
                  aria-label="Kind of change"
                  options={KIND_OPTIONS}
                  value={kind}
                  onChange={(event) => setKind(event.target.value)}
                  className="sm:w-48"
                />
              }
              hasActiveFilters={Boolean(search || kind)}
              onResetFilters={() => {
                setSearch('');
                setKind('');
              }}
            />
          }
          emptyState={
            <EmptyState
              icon={<History className="size-6" />}
              title={search || kind ? 'No changes match' : 'No access changes yet'}
              description={
                search || kind
                  ? 'Try another search, or show every change.'
                  : 'When somebody changes a role, a person’s roles, a permission override or an access scope, it is recorded here.'
              }
            />
          }
        />
      </Card>
      <p className="mt-3 text-xs text-slate-500">The latest 500 changes are shown. Entries cannot be edited or removed.</p>
    </>
  );
}
