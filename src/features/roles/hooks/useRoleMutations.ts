import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';

import type { RoleInput } from '../schemas';
import { roleService } from '../services/roleService';

import { roleKeys } from './useRoles';

/**
 * Invalidate everything a role write can affect.
 *
 * Changing a role's permissions changes what the *current* user may do, so
 * the session is refreshed too — otherwise the sidebar and `Can` guards would
 * keep using the permission set captured at sign-in.
 */
function useInvalidateRoles() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: roleKeys.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() }),
    ]);
  };
}

export function useCreateRole() {
  const invalidate = useInvalidateRoles();

  return useMutation({
    mutationFn: (input: RoleInput) => roleService.create(input),
    onSuccess: async (role) => {
      await invalidate();
      toast.success('Role created', `"${role.name}" is ready to assign.`);
    },
  });
}

export function useUpdateRole(id: number | string) {
  const invalidate = useInvalidateRoles();

  return useMutation({
    mutationFn: (input: RoleInput) => roleService.update(id, input),
    onSuccess: async (role) => {
      await invalidate();
      toast.success('Role updated', `Changes to "${role.name}" have been saved.`);
    },
  });
}

export function useDeleteRole() {
  const invalidate = useInvalidateRoles();

  return useMutation({
    mutationFn: (id: number) => roleService.remove(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Role deleted');
    },
  });
}
