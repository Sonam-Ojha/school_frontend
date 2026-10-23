import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { toast } from '@/store/toastStore';

import type { DeviceInput, QrSessionInput } from '../schemas';
import { deviceService } from '../services/deviceService';
import type { QrSession } from '../types';

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

export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeviceInput) => deviceService.createDevice(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}

export function useUpdateDevice(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeviceInput) => deviceService.updateDevice(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toast.success('Reader updated');
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deviceService.removeDevice(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toast.success('Reader removed', 'Its scans are no longer accepted.');
    },
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

/**
 * A session's QR code as an object URL, or `undefined` while it loads.
 *
 * The image endpoint needs the sign-in token, which a plain `<img src>` cannot
 * send, so the bytes are fetched like any other request and handed to the
 * image as a local URL.
 */
export function useQrImage(session: QrSession): string | undefined {
  const { data } = useQuery({
    // Its own key: the code for a session never changes, so refreshing the
    // session list must not refetch every image.
    queryKey: ['attendance', 'qr-image', session.id],
    queryFn: ({ signal }) => deviceService.qrImage(session, signal),
    staleTime: Infinity,
  });

  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!data) return;
    const objectUrl = URL.createObjectURL(data);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [data]);

  return url;
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
