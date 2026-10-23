import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { roleKeys } from '@/features/roles/hooks/useRoles';
import { createResourceKeys, queryKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import { userService, type UserWrite } from '../services/userService';

export const userKeys = createResourceKeys('users');

/** Paginated account list. Pass `queryParams` straight from `useTableQueryState`. */
export function useUsers(params: ListQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => userService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

/**
 * Invalidate everything an account write can affect.
 *
 * Each role shows how many people hold it, and editing your own account can
 * change what you may do — so the role list and the session are refreshed too.
 */
function useInvalidateUsers() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: userKeys.all }),
      queryClient.invalidateQueries({ queryKey: roleKeys.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() }),
    ]);
  };
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();

  return useMutation({
    mutationFn: (input: UserWrite) => userService.create(input),
    onSuccess: async (user) => {
      await invalidate();
      toast.success('User created', `${user.name} can now sign in with ${user.email}.`);
    },
  });
}

export function useUpdateUser(id: number | string) {
  const invalidate = useInvalidateUsers();

  return useMutation({
    mutationFn: (input: UserWrite) => userService.update(id, input),
    onSuccess: async (user) => {
      await invalidate();
      toast.success('User updated', `Changes to ${user.name} have been saved.`);
    },
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers();

  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('User deleted');
    },
  });
}
