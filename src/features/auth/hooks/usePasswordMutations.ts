import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';

import type { ChangePasswordInput, ForgotPasswordInput, ResetPasswordInput } from '../schemas';
import { authService } from '../services/authService';

/**
 * Requests a reset link.
 *
 * The success message is deliberately identical whether or not the address is
 * registered — the screen must not confirm which emails have accounts.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authService.forgotPassword(input),
  });
}

/** Completes a reset using the token from the emailed link. */
export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authService.resetPassword(input),
  });
}

/**
 * Changes the password of the signed-in user.
 *
 * The backend is expected to revoke the user's other tokens, so other devices
 * are signed out — the current session stays alive.
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangePasswordInput) => authService.changePassword(input),
    onSuccess: async (data) => {
      // Those revoked tokens are still listed on the profile page.
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.devices() });
      toast.success('Password updated', data.message || 'Your other devices have been signed out.');
    },
  });
}
