/**
 * Wire contract with the Laravel API.
 *
 * These mirror Laravel's `JsonResource` / `ResourceCollection` output so the
 * frontend never hand-reshapes a payload in a component.
 */

/** Single-resource response: `new UserResource($user)`. */
export interface ApiResource<T> {
  data: T;
  message?: string;
}

/** Laravel pagination meta emitted by `AnonymousResourceCollection`. */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

/** Paginated collection: `UserResource::collection($paginator)`. */
export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/** Non-paginated collection: `UserResource::collection($collection)`. */
export interface CollectionResponse<T> {
  data: T[];
}

/** Laravel 422 body from `FormRequest` validation. */
export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

/**
 * Every answer from the API has the same envelope:
 * `{ success, code, message, data }`. For a refusal, `code` is the HTTP
 * status and `data` carries the details — `errors` per form field, and
 * `reason`, a word the app can act on.
 */
export interface ApiErrorResponse {
  success?: false;
  code?: number | string;
  message: string;
  data?: {
    errors?: Record<string, string[]>;
    /**
     * Why, in a word the app can act on. Sent for refusals that are about the
     * school's subscription rather than the request: `school_not_found`,
     * `school_suspended`, `subscription_expired`, `module_unavailable`,
     * `plan_limit`.
     */
    reason?: string;
    [detail: string]: unknown;
  } | null;
  /** Answers from before the envelope put these at the top level. */
  errors?: Record<string, string[]>;
}

/** Query params every index endpoint accepts. */
export interface ListQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: SortDirection;
  [filter: string]: unknown;
}

export type SortDirection = 'asc' | 'desc';
