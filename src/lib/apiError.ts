import axios from 'axios';

import { HTTP_STATUS } from '@/config/constants';
import type { ApiErrorResponse } from '@/types/api';

/**
 * Normalised transport error.
 *
 * Every failure — network, 4xx, 5xx — reaches the UI as one of these, so
 * components never branch on `axios.isAxiosError` or poke at `err.response`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]>;
  readonly isNetworkError: boolean;
  /** The platform's reason for a subscription refusal, e.g. `subscription_expired`. */
  readonly code: string | null;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> = {},
    isNetworkError = false,
    code: string | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
    this.code = code;
  }

  /** 422 — Laravel FormRequest rejected the payload. */
  get isValidationError(): boolean {
    return this.status === HTTP_STATUS.unprocessable;
  }

  get isUnauthorized(): boolean {
    return this.status === HTTP_STATUS.unauthorized;
  }

  get isForbidden(): boolean {
    return this.status === HTTP_STATUS.forbidden;
  }

  get isNotFound(): boolean {
    return this.status === HTTP_STATUS.notFound;
  }

  /** Worth retrying: transient network blips and server faults. */
  get isRetryable(): boolean {
    return this.isNetworkError || this.status >= HTTP_STATUS.serverError;
  }

  /** First message for a given field, for inline form errors. */
  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }
}

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

const STATUS_MESSAGES: Record<number, string> = {
  [HTTP_STATUS.badRequest]: 'The request could not be processed.',
  [HTTP_STATUS.unauthorized]: 'Your session has expired. Please sign in again.',
  [HTTP_STATUS.forbidden]: 'You do not have permission to perform this action.',
  [HTTP_STATUS.notFound]: 'The requested resource was not found.',
  [HTTP_STATUS.conflict]: 'This action conflicts with the current state of the record.',
  [HTTP_STATUS.unprocessable]: 'Please correct the highlighted fields.',
  [HTTP_STATUS.tooManyRequests]: 'Too many attempts. Please wait a moment and try again.',
  [HTTP_STATUS.serverError]: 'A server error occurred. Our team has been notified.',
};

/** Convert anything thrown by axios (or by us) into an `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      const aborted = error.code === 'ECONNABORTED';
      return new ApiError(
        aborted ? 'The request timed out. Please try again.' : 'Unable to reach the server.',
        0,
        {},
        true,
      );
    }

    const { status, data } = error.response;
    return new ApiError(
      data?.message?.trim() || STATUS_MESSAGES[status] || DEFAULT_MESSAGE,
      status,
      data?.errors ?? {},
      false,
      typeof data?.code === 'string' ? data.code : null,
    );
  }

  return new ApiError(error instanceof Error ? error.message : DEFAULT_MESSAGE, 0);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
