import { schoolCode } from '@/app/tenant';

/** Where a school's session is kept on this device. */
export const schoolSessionKey = (code: string): string => `school-erp.auth.${code}`;

/**
 * Storage keys — namespaced so multiple apps can share an origin safely.
 *
 * The session is kept per school: being signed in to one school says nothing
 * about another, and its token must never be sent to one.
 */
export const STORAGE_KEYS = {
  auth: schoolCode ? schoolSessionKey(schoolCode) : 'school-erp.auth',
  platformAuth: 'school-erp.platform-auth',
} as const;

/** Matches Laravel's default `perPage` options so the API never rejects a value. */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const DEFAULT_PAGE_SIZE = 25;

/** Debounce for search-as-you-type before a request is fired. */
export const SEARCH_DEBOUNCE_MS = 400;

export const HTTP_STATUS = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  unprocessable: 422,
  tooManyRequests: 429,
  serverError: 500,
} as const;
