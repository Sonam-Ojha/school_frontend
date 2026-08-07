import { KeyRound, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { roleLabel } from '@/types/auth';

import { ACTION_LABELS, type PermissionAction } from '../constants';
import { usePermissions } from '../hooks/usePermissions';
import { parsePermission, resourceLabel } from '../utils/groupPermissions';

const actionLabel = (action: string) =>
  ACTION_LABELS[action as PermissionAction] ?? action.charAt(0).toUpperCase() + action.slice(1);

/**
 * Read-only reference of every seeded permission and the roles that hold it.
 *
 * Permissions are created by the backend seeder, never through the UI — a
 * permission with no code enforcing it would be misleading. Granting happens
 * on the role edit screen.
 */
export default function PermissionListPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data, isLoading, error } = usePermissions(true);

  const byResource = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    const map = new Map<string, { name: string; action: string; roles: string[] }[]>();

    for (const permission of data ?? []) {
      const { resource, action, name } = parsePermission(permission);
      if (term && !name.toLowerCase().includes(term)) continue;

      const rows = map.get(resource) ?? [];
      rows.push({ name, action, roles: permission.roles ?? [] });
      map.set(resource, rows);
    }

    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data, debouncedSearch]);

  const total = data?.length ?? 0;

  return (
    <>
      <PageHeader
        title="Permissions"
        description="Every permission in the system and the roles that hold it."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Permissions' }]}
      />

      <div className="space-y-4">
        <Alert tone="info">
          Permissions are seeded by the backend and cannot be created here. To grant them, edit a
          role.
        </Alert>

        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search permissions…"
          aria-label="Search permissions"
          leftIcon={<Search className="size-4" />}
          className="sm:max-w-sm"
        />

        {error ? (
          <Alert tone="danger" title="Could not load permissions">
            {error.message}
          </Alert>
        ) : isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i}>
                <CardBody className="space-y-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-2/3" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : byResource.length === 0 ? (
          <Card>
            <CardBody>
              <EmptyState
                icon={<KeyRound className="size-6" />}
                title={total === 0 ? 'No permissions seeded' : 'No permissions match your search'}
                description={
                  total === 0
                    ? 'Run the backend permission seeder to populate this list.'
                    : 'Try a different search term.'
                }
              />
            </CardBody>
          </Card>
        ) : (
          byResource.map(([resource, rows]) => (
            <Card key={resource}>
              <CardHeader
                title={resourceLabel(resource)}
                description={`${rows.length} permission${rows.length === 1 ? '' : 's'}`}
              />
              <CardBody className="p-0">
                <ul className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <li
                      key={row.name}
                      className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {actionLabel(row.action)}
                        </p>
                        <code className="text-xs text-slate-500">{row.name}</code>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {row.roles.length > 0 ? (
                          row.roles.map((role) => (
                            <Badge key={role} tone="info">
                              {roleLabel(role)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Not granted to any role</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
