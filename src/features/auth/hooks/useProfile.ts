import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import type { AuthUser } from '@/types/auth';

import type { UpdateProfileInput } from '../schemas';
import { authService } from '../services/authService';

/**
 * Push a fresh user record into both the session store and the query cache so
 * the topbar, sidebar and profile page update from a single write.
 */
function useApplyUser() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return (user: AuthUser) => {
    setUser(user);
    queryClient.setQueryData(queryKeys.auth.session(), user);
  };
}

export function useUpdateProfile() {
  const applyUser = useApplyUser();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => authService.updateProfile(input),
    onSuccess: (user) => {
      applyUser(user);
      toast.success('Profile updated');
    },
  });
}

export function useUpdateAvatar() {
  const applyUser = useApplyUser();

  return useMutation({
    mutationFn: (file: File) => authService.updateAvatar(file),
    onSuccess: (user) => {
      applyUser(user);
      toast.success('Photo updated');
    },
  });
}
