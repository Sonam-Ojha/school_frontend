import { http } from '@/lib/axios';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type { DeviceInput, QrSessionInput } from '../schemas';
import type { BiometricDevice, CheckInResult, QrSession, RegisteredDevice } from '../types';

const toDevicePayload = (input: DeviceInput) => ({
  name: input.name.trim(),
  serial_number: input.serial_number.trim().toUpperCase(),
  location: input.location.trim() || null,
  ...(input.regenerate_key ? { regenerate_key: true } : {}),
});

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

  /** Registers a reader. The reply carries its key, which is shown once. */
  async createDevice(input: DeviceInput): Promise<RegisteredDevice> {
    const { data } = await http.post<ApiResource<RegisteredDevice>>(
      '/attendance/devices',
      toDevicePayload(input),
    );
    return data.data;
  },

  async updateDevice(id: number, input: DeviceInput): Promise<RegisteredDevice> {
    const { data } = await http.put<ApiResource<RegisteredDevice>>(
      `/attendance/devices/${id}`,
      toDevicePayload(input),
    );
    return data.data;
  },

  async removeDevice(id: number): Promise<void> {
    await http.delete(`/attendance/devices/${id}`);
  },

  /**
   * Checks the signed-in person in with the code they scanned. The server
   * decides who that is from the session — nobody is named in the request,
   * so nobody can be checked in by somebody else.
   */
  async checkIn(token: string): Promise<{ data: CheckInResult; message: string }> {
    const { data } = await http.post<{ data: CheckInResult; message: string }>(
      '/attendance/check-in',
      { token },
    );
    return data;
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
   * Fetched rather than linked: the endpoint needs the sign-in token, which an
   * `<img src>` pointing straight at the API cannot send.
   */
  async qrImage(session: QrSession, signal?: AbortSignal): Promise<Blob> {
    const { data } = await http.get<Blob>(`/attendance/qr-sessions/${session.id}/image`, {
      responseType: 'blob',
      signal,
    });
    return data;
  },
};
