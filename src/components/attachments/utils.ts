import { env } from '@/config/env';

/**
 * Attachment URLs come back as API paths; an absolute one (a CDN) is left
 * alone. Kept apart from the preview components so Fast Refresh keeps working
 * on them.
 */
export function attachmentUrl(url: string): string {
  return url.startsWith('http') ? url : `${env.apiBaseUrl}${url}`;
}

/** `3:45` from a duration in seconds. */
export function formatDuration(seconds: number | null): string | null {
  if (seconds === null) return null;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
