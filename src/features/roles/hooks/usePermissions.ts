import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';

import { permissionService } from '../services/permissionService';
import { groupPermissions, resolveActionColumns } from '../utils/groupPermissions';

export const permissionKeys = createResourceKeys('permissions');

/**
 * All permissions, pre-grouped into matrix rows.
 *
 * The set is seeded and effectively static, so it is cached aggressively —
 * the role form and the permissions screen share one fetch.
 */
export function usePermissions(withRoles = false) {
  const query = useQuery({
    queryKey: [...permissionKeys.all, { withRoles }] as const,
    queryFn: ({ signal }) => permissionService.all(withRoles, signal),
    staleTime: 15 * 60_000,
  });

  const { data } = query;

  const groups = useMemo(() => groupPermissions(data ?? []), [data]);
  const actions = useMemo(() => resolveActionColumns(groups), [groups]);

  return { ...query, groups, actions };
}
