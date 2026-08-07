import { useQuery } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import type { ListQueryParams } from '@/types/api';

import { roleService } from '../services/roleService';

export const roleKeys = createResourceKeys('roles');

/** Paginated role list. Pass `queryParams` straight from `useTableQueryState`. */
export function useRoles(params: ListQueryParams) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: ({ signal }) => roleService.list(params, signal),
    // Keeps the previous page on screen while the next one loads, so the
    // table does not collapse to skeletons on every pagination click.
    placeholderData: (previous) => previous,
  });
}

/** Single role including its assigned permission names. */
export function useRole(id: number | string | undefined) {
  return useQuery({
    queryKey: roleKeys.detail(id ?? ''),
    queryFn: ({ signal }) => roleService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

/** Unpaginated roles for select inputs. */
export function useRoleOptions() {
  return useQuery({
    queryKey: roleKeys.options(),
    queryFn: ({ signal }) => roleService.options(signal),
    staleTime: 5 * 60_000,
  });
}
