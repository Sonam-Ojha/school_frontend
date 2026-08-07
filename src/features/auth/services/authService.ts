import { ensureCsrfCookie, http } from '@/lib/axios';
import type { ApiResource, CollectionResponse } from '@/types/api';
import type { AuthUser } from '@/types/auth';

import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from '../schemas';
import type { AuthSessionToken, LoginResponseData, MessageResponse } from '../types';

/**
 * Label the issued Sanctum token so the user can recognise it in the
 * "signed-in devices" list. Coarse on purpose — enough to identify a device
 * without fingerprinting it.
 */
function deviceName(): string {
  const ua = navigator.userAgent;
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : /Firefox\//.test(ua) ? 'Firefox'
    : 'Browser';

  const platform =
    /Windows/.test(ua) ? 'Windows'
    : /Macintosh|Mac OS/.test(ua) ? 'macOS'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Unknown OS';

  return `${browser} on ${platform}`;
}

/** Emails are case-insensitive identifiers; normalise before they leave. */
const normaliseEmail = (value: string): string => value.trim().toLowerCase();

/**
 * All auth I/O. Hooks call this; components never do.
 *
 * `ensureCsrfCookie()` is a no-op in token mode and fetches Sanctum's CSRF
 * cookie in cookie mode, so both auth modes share one code path.
 */
export const authService = {
  async login(input: LoginInput): Promise<LoginResponseData> {
    await ensureCsrfCookie();

    const { data } = await http.post<ApiResource<LoginResponseData>>('/auth/login', {
      email: normaliseEmail(input.email),
      password: input.password,
      remember: input.remember,
      device_name: deviceName(),
    });

    return data.data;
  },

  /**
   * Revokes the current token server-side. Callers must clear local state
   * regardless of the outcome — an already-invalid token still means the user
   * is signed out.
   */
  async logout(): Promise<void> {
    await http.post('/auth/logout');
  },

  /** Revokes every token for the user, signing out all devices. */
  async logoutAll(): Promise<void> {
    await http.post('/auth/logout-all');
  },

  /** Session probe. A 401 here is the expected "not signed in" answer. */
  async me(signal?: AbortSignal): Promise<AuthUser> {
    const { data } = await http.get<ApiResource<AuthUser>>('/auth/me', { signal });
    return data.data;
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<MessageResponse> {
    await ensureCsrfCookie();
    const { data } = await http.post<MessageResponse>('/auth/forgot-password', {
      email: normaliseEmail(input.email),
    });
    return data;
  },

  async resetPassword(input: ResetPasswordInput): Promise<MessageResponse> {
    await ensureCsrfCookie();
    const { data } = await http.post<MessageResponse>('/auth/reset-password', {
      ...input,
      email: normaliseEmail(input.email),
    });
    return data;
  },

  async changePassword(input: ChangePasswordInput): Promise<MessageResponse> {
    const { data } = await http.put<MessageResponse>('/auth/password', input);
    return data;
  },

  async updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
    const { data } = await http.put<ApiResource<AuthUser>>('/auth/profile', {
      name: input.name.trim(),
      email: normaliseEmail(input.email),
      // An empty field means "no phone number", which the API stores as null.
      phone: input.phone.trim() || null,
    });
    return data.data;
  },

  /** Multipart upload — the axios instance drops the JSON content type itself. */
  async updateAvatar(file: File): Promise<AuthUser> {
    const body = new FormData();
    body.append('avatar', file);

    const { data } = await http.post<ApiResource<AuthUser>>('/auth/profile/avatar', body);
    return data.data;
  },

  async sessions(signal?: AbortSignal): Promise<AuthSessionToken[]> {
    const { data } = await http.get<CollectionResponse<AuthSessionToken>>('/auth/sessions', {
      signal,
    });
    return data.data;
  },

  async revokeSession(id: number): Promise<void> {
    await http.delete(`/auth/sessions/${id}`);
  },
};
