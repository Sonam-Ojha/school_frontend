/** Storage keys — namespaced so multiple apps can share an origin safely. */
export const STORAGE_KEYS = {
  auth: 'school-erp.auth',
  ui: 'school-erp.ui',
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
