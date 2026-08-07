import type { AxiosRequestConfig } from 'axios';

import { ApiError, toApiError } from './apiError';
import { http } from './axios';

/**
 * Download a file from the API.
 *
 * Blob responses need special error handling: when a download fails the server
 * still replies with JSON, but axios has already decoded it as a Blob — so the
 * usual interceptor sees an unreadable body. This reads the blob back and
 * rethrows a normal `ApiError`, letting callers handle it like any other
 * failure.
 */
export async function downloadFile(
  url: string,
  filename: string,
  config: AxiosRequestConfig = {},
): Promise<void> {
  try {
    const response = await http.get<Blob>(url, { ...config, responseType: 'blob' });

    // The server may supply a better name than the caller guessed.
    const disposition = response.headers['content-disposition'] as string | undefined;
    saveBlob(response.data, filenameFromDisposition(disposition) ?? filename);
  } catch (error) {
    throw await blobErrorToApiError(error);
  }
}

/** Trigger a browser save for an in-memory blob. */
export function saveBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  link.remove();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

/** `attachment; filename="students.xlsx"` → `students.xlsx`. */
function filenameFromDisposition(disposition: string | undefined): string | null {
  if (!disposition) return null;

  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8?.[1]) return decodeURIComponent(utf8[1]);

  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain?.[1] ?? null;
}

/** Recover the JSON error the server sent inside a blob response. */
async function blobErrorToApiError(error: unknown): Promise<ApiError> {
  const apiError = toApiError(error);

  const response = (error as { response?: { data?: unknown; status?: number } })?.response;
  const data = response?.data;

  if (data instanceof Blob && data.type.includes('json')) {
    try {
      const parsed = JSON.parse(await data.text()) as { message?: string; errors?: Record<string, string[]> };
      return new ApiError(
        parsed.message ?? apiError.message,
        response?.status ?? apiError.status,
        parsed.errors ?? {},
      );
    } catch {
      // Fall through to the generic error below.
    }
  }

  return apiError;
}

/** Build a dated filename, e.g. `students-2026-08-06.xlsx`. */
export function timestampedFilename(base: string, extension: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${base}-${stamp}.${extension}`;
}
