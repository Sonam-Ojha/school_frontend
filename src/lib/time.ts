/**
 * Clock-time helpers for `HH:mm` values.
 *
 * The API speaks 24-hour `HH:mm` everywhere — it sorts as a string, survives a
 * timezone change and is what `<input type="time">` reads and writes. Display
 * and arithmetic happen here so no module re-derives them, and so the
 * timetable and the exam schedule agree on what "overlapping" means.
 */

/** `'09:30'` → `570`. Returns null for anything that is not a clock time. */
export function toMinutes(time: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** `570` → `'09:30'`. Wraps past midnight rather than producing `'25:00'`. */
export function fromMinutes(minutes: number): string {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  return `${String(hours).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}

/** `'09:30'` + 45 → `'10:15'`. */
export function addMinutes(time: string, minutes: number): string | null {
  const start = toMinutes(time);
  return start === null ? null : fromMinutes(start + minutes);
}

/** Length of a slot in minutes. Null if either end is unreadable. */
export function durationBetween(start: string, end: string): number | null {
  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from === null || to === null) return null;
  // An end before the start means the slot runs past midnight.
  return to >= from ? to - from : 1440 - from + to;
}

/**
 * Do two clock ranges overlap?
 *
 * Touching ranges do not: a period ending at 10:00 and the next starting at
 * 10:00 are back to back, which is how every timetable in the world is built.
 */
export function overlaps(
  first: { start: string; end: string },
  second: { start: string; end: string },
): boolean {
  const aStart = toMinutes(first.start);
  const aEnd = toMinutes(first.end);
  const bStart = toMinutes(second.start);
  const bEnd = toMinutes(second.end);
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return false;

  return aStart < bEnd && bStart < aEnd;
}

/** `'09:30'` → `'9:30 am'`. Falls back to the raw value if it is unreadable. */
export function formatTime(time: string | null | undefined, fallback = '—'): string {
  if (!time) return fallback;

  const minutes = toMinutes(time);
  if (minutes === null) return time;

  const hours = Math.floor(minutes / 60);
  const suffix = hours < 12 ? 'am' : 'pm';
  const display = hours % 12 === 0 ? 12 : hours % 12;

  return `${display}:${String(minutes % 60).padStart(2, '0')} ${suffix}`;
}

/** `'09:30'`–`'10:15'` → `'9:30 – 10:15 am'`, collapsing a shared suffix. */
export function formatTimeRange(start: string, end: string): string {
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  if (startMinutes === null || endMinutes === null) return `${start} – ${end}`;

  const sameHalf = startMinutes < 720 === endMinutes < 720;
  const left = sameHalf ? formatTime(start).replace(/\s(am|pm)$/, '') : formatTime(start);

  return `${left} – ${formatTime(end)}`;
}
