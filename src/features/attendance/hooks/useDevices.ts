import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/store/toastStore';

import type { QrSessionInput } from '../schemas';
import { deviceService } from '../services/deviceService';

const deviceKeys = {
  all: ['attendance', 'devices'] as const,
  qrSessions: ['attendance', 'qr-sessions'] as const,
};

export function useBiometricDevices() {
  return useQuery({
    queryKey: deviceKeys.all,
    queryFn: ({ signal }) => deviceService.devices(signal),
    // Device health goes stale quickly; poll while the page is open.
    refetchInterval: 60_000,
  });
}

export function useSyncDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deviceService.syncDevice(id),
    onSuccess: async (device) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
        // A sync writes attendance records.
        queryClient.invalidateQueries({ queryKey: ['attendance', 'sheet'] }),
        queryClient.invalidateQueries({ queryKey: ['attendance', 'monthly'] }),
      ]);

      toast.success(
        `${device.name} synced`,
        device.last_sync_count === 0
          ? 'No new punches were waiting.'
          : `${device.last_sync_count} punch${device.last_sync_count === 1 ? '' : 'es'} imported.`,
      );
    },
    onError: (error) => toast.error('Sync failed', error.message),
    meta: { skipGlobalError: true },
  });
}

export function useQrSessions() {
  return useQuery({
    queryKey: deviceKeys.qrSessions,
    queryFn: ({ signal }) => deviceService.qrSessions(signal),
    // Codes expire and check-ins arrive while the screen is open.
    refetchInterval: 15_000,
  });
}

export function useCreateQrSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: QrSessionInput) => deviceService.createQrSession(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: deviceKeys.qrSessions });
      toast.success('Check-in code ready', 'Display it for scanning before it expires.');
    },
  });
}

export function useRevokeQrSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deviceService.revokeQrSession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: deviceKeys.qrSessions });
      toast.success('Check-in code revoked');
    },
  });
}
