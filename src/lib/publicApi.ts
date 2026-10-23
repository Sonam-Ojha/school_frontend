import axios, { type AxiosInstance } from 'axios';

import { env } from '@/config/env';

import { toApiError } from './apiError';

/**
 * For the platform's public endpoints: plans, school look-up, sign-up,
 * enquiries. It carries no session and never signs anybody out, so a refusal
 * here cannot be mistaken for an expired sign-in.
 */
export const publicApi: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 180_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

publicApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
