import { formatDateTime } from './format';

/**
 * How long ago, in the words somebody would use.
 *
 * Anything past a week gets the actual date: "13 days ago" is arithmetic the
 * reader then has to undo, whereas a feed's whole point is the last day or
 * two. Extracted when the notification bell wanted what the dashboard's
 * activity feed already had.
 *
 * `now` is a parameter so the awkward cases — a timestamp from the future,
 * the boundary between "yesterday" and "2 days ago" — can be tested without
 * waiting for a clock.
 */
export function relativeTime(value: string, now: Date = new Date()): string {
  const then = Date.parse(value);
  if (Number.isNaN(then)) return '';

  const minutes = Math.round((now.getTime() - then) / 60_000);

  // Clock skew between a server and a browser routinely puts a "just now"
  // timestamp a few seconds ahead. "In 1 minute" for something that has
  // already happened reads as a bug.
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;

  return formatDateTime(value);
}
