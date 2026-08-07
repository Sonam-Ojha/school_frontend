import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';

import { authService } from '../services/authService';

/** Devices with a live token for this account. */
export function useAuthSessions() {
  return useQuery({
    queryKey: queryKeys.auth.devices(),
    queryFn: ({ signal }) => authService.sessions(signal),
    staleTime: 30_000,
  });
}

/** Revokes one device's token, signing that device out. */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => authService.revokeSession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.devices() });
      toast.success('Device signed out');
    },
  });
}
