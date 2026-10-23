import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { schoolCode } from '@/app/tenant';
import { env } from '@/config/env';
import { authStore } from '@/store/authStore';

import { toApiError } from './apiError';

/**
 * Single axios instance for the whole app. Feature services import this —
 * never `axios` directly — so auth, error normalisation and cancellation
 * behave identically everywhere.
 */
export const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  // Required for Sanctum cookie sessions; harmless in token mode.
  withCredentials: env.authMode === 'cookie',
  withXSRFToken: env.authMode === 'cookie',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Which school this request is for. The platform routes it to that
  // school's own server; a single-school server ignores it.
  if (schoolCode) config.headers.set('X-School', schoolCode);

  if (env.authMode === 'token') {
    const token = authStore.getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Let the browser set the multipart boundary itself.
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }

  return config;
});

/**
 * Called once when the server rejects our credentials. Wired up by the auth
 * feature so this module stays free of routing and React dependencies.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);

    // A 401 on a probe endpoint is the expected "not logged in" answer, not
    // an expiry — the auth module handles that case itself.
    if (apiError.isUnauthorized && !isSessionProbe(error)) {
      authStore.clear();
      onUnauthorized?.();
    }

    return Promise.reject(apiError);
  },
);

/**
 * Requests whose 401 says nothing about the session: the boot-time check of
 * who is signed in, and the public list of demo accounts — which a server
 * that predates it guards like any other route.
 */
function isSessionProbe(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const url = error.config?.url ?? '';
  return url.includes('/auth/me') || url.includes('/auth/demo-accounts');
}

/** Fetch the Sanctum CSRF cookie. No-op outside cookie mode. */
export async function ensureCsrfCookie(): Promise<void> {
  if (env.authMode !== 'cookie') return;
  await axios.get(`${env.appUrl}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
}
