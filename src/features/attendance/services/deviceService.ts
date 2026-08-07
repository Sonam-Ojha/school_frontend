import { http } from '@/lib/axios';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type { QrSessionInput } from '../schemas';
import type { BiometricDevice, QrSession } from '../types';

/**
 * Capture devices — the QR and biometric side of attendance.
 *
 * Neither captures anything in the browser: a QR code must be signed and
 * rendered server-side (a client-generated one could be screenshotted and
 * replayed), and biometric readers push to the backend directly. What the
 * frontend owns is issuing sessions, showing device health, and triggering a
 * sync — which is what makes the module "ready" for both.
 */
export const deviceService = {
  async devices(signal?: AbortSignal): Promise<BiometricDevice[]> {
    const { data } = await http.get<CollectionResponse<BiometricDevice>>('/attendance/devices', {
      params: { per_page: 'all' },
      signal,
    });
    return data.data;
  },

  /** Pulls any punches the device has buffered since the last sync. */
  async syncDevice(id: number): Promise<BiometricDevice> {
    const { data } = await http.post<ApiResource<BiometricDevice>>(
      `/attendance/devices/${id}/sync`,
    );
    return data.data;
  },

  async qrSessions(signal?: AbortSignal): Promise<QrSession[]> {
    const { data } = await http.get<CollectionResponse<QrSession>>('/attendance/qr-sessions', {
      params: { active: 1 },
      signal,
    });
    return data.data;
  },

  async createQrSession(input: QrSessionInput): Promise<QrSession> {
    const { data } = await http.post<ApiResource<QrSession>>('/attendance/qr-sessions', {
      type: input.type,
      class_id: input.class_id,
      section_id: input.section_id,
      valid_for_minutes: input.valid_for_minutes,
    });
    return data.data;
  },

  /** Ends a session early, invalidating the code immediately. */
  async revokeQrSession(id: number): Promise<void> {
    await http.delete(`/attendance/qr-sessions/${id}`);
  },

  /**
   * The scannable image, rendered and signed by the backend.
   *
   * Returned as a URL rather than fetched — an `<img src>` lets the browser
   * cache and re-render it without this layer holding the bytes.
   */
  qrImageUrl(session: QrSession): string {
    return `/attendance/qr-sessions/${session.id}/image`;
  },
};
