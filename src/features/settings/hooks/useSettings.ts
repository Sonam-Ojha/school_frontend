import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';

import { settingsService } from '../services/settingsService';
import type { SchoolSettings } from '../types';

export const settingsKeys = createResourceKeys('settings');

/** Single cache entry for the whole settings object. */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: ({ signal }) => settingsService.show(signal),
    // Settings change rarely and are read on nearly every screen.
    staleTime: 10 * 60_000,
  });
}

/**
 * Shared wiring for the group forms.
 *
 * Every group PUT returns the full settings object, so the response is written
 * straight into the cache — no refetch, and the other tabs stay in sync.
 */
function useSettingsMutation<TInput>(
  mutationFn: (input: TInput) => Promise<SchoolSettings>,
  successMessage: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsKeys.all, settings);
      toast.success(successMessage);
    },
  });
}

export const useUpdateProfile = () =>
  useSettingsMutation(settingsService.updateProfile, 'School profile updated');

export const useUpdateAddress = () =>
  useSettingsMutation(settingsService.updateAddress, 'Address updated');

export const useUpdateLocalization = () =>
  useSettingsMutation(settingsService.updateLocalization, 'Regional settings updated');

export const useUpdateEmail = () =>
  useSettingsMutation(settingsService.updateEmail, 'Email settings updated');

export const useUpdateSms = () => useSettingsMutation(settingsService.updateSms, 'SMS settings updated');

export const useUploadLogo = () => useSettingsMutation(settingsService.uploadLogo, 'Logo updated');

export const useRemoveLogo = () =>
  useSettingsMutation<void>(settingsService.removeLogo, 'Logo removed');

/**
 * Delivery tests. These report their own result — including the failure,
 * which is the useful half — so the global error toast is suppressed.
 */
export function useSendTestEmail() {
  return useMutation({
    mutationFn: settingsService.sendTestEmail,
    onSuccess: (data) => toast.success('Test email sent', data.message),
    onError: (error) => toast.error('Test email failed', error.message),
    meta: { skipGlobalError: true },
  });
}

export function useSendTestSms() {
  return useMutation({
    mutationFn: settingsService.sendTestSms,
    onSuccess: (data) => toast.success('Test SMS sent', data.message),
    onError: (error) => toast.error('Test SMS failed', error.message),
    meta: { skipGlobalError: true },
  });
}
