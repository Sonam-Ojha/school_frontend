/**
 * Display formatters. Centralised so dates and money read the same on every
 * screen and the locale is a one-line change.
 */

const LOCALE = 'en-IN';
const CURRENCY = 'INR';

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat(LOCALE);

function parse(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined, fallback = '—'): string {
  const date = parse(value);
  return date ? dateFormatter.format(date) : fallback;
}

export function formatDateTime(value: string | Date | null | undefined, fallback = '—'): string {
  const date = parse(value);
  return date ? dateTimeFormatter.format(date) : fallback;
}

/** `yyyy-MM-dd` for `<input type="date">` and API payloads. */
export function toDateInputValue(value: string | Date | null | undefined): string {
  const date = parse(value);
  if (!date) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * Today, in the *local* calendar, as an `<input type="date">` value.
 *
 * Exists because `new Date().toISOString().slice(0, 10)` does not do this and
 * was written out in a dozen places. `toISOString` formats in UTC, so east of
 * Greenwich it returns *yesterday* between local midnight and the offset —
 * before half past five in the morning here. Every form that defaulted to
 * "today" that way was defaulting to yesterday for anyone working early: a
 * leave application, a fee receipt, a book issued at dawn.
 */
export const todayInputValue = (): string => toDateInputValue(new Date());

export function formatCurrency(value: number | string | null | undefined, fallback = '—'): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  if (amount === null || amount === undefined || Number.isNaN(amount)) return fallback;
  return currencyFormatter.format(amount);
}

export function formatNumber(value: number | null | undefined, fallback = '—'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback;
  return numberFormatter.format(value);
}

/** Whole years since a date — used for student age from date of birth. */
export function ageFrom(value: string | Date | null | undefined): number | null {
  const birth = parse(value);
  if (!birth) return null;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();

  // Not had this year's birthday yet.
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) age -= 1;

  return age >= 0 ? age : null;
}

/** Human file size, e.g. `1.4 MB`. Uses binary units, as file managers do. */
export function formatBytes(bytes: number | null | undefined, fallback = '—'): string {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return fallback;
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

/** Two-letter initials for avatar fallbacks. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
  'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const belowHundred = (n: number): string => (n < 20 ? ONES[n]! : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`);

const belowThousand = (n: number): string =>
  [Math.floor(n / 100) ? `${ONES[Math.floor(n / 100)]} Hundred` : '', n % 100 ? belowHundred(n % 100) : '']
    .filter(Boolean)
    .join(' ');

/**
 * An amount in words, the Indian way, as receipts write it:
 * 1,12,500.50 → "Rupees One Lakh Twelve Thousand Five Hundred and Fifty Paise Only".
 */
export function rupeesInWords(amount: number): string {
  const whole = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - whole) * 100);

  const parts: string[] = [];
  let rest = whole;
  const crore = Math.floor(rest / 1_00_00_000);
  rest %= 1_00_00_000;
  const lakh = Math.floor(rest / 1_00_000);
  rest %= 1_00_000;
  const thousand = Math.floor(rest / 1000);
  rest %= 1000;

  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowHundred(lakh)} Lakh`);
  if (thousand) parts.push(`${belowHundred(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));

  const rupees = parts.length > 0 ? parts.join(' ') : 'Zero';
  return `Rupees ${rupees}${paise ? ` and ${belowHundred(paise)} Paise` : ''} Only`;
}

/**
 * A `wa.me` link that opens WhatsApp with a message ready to send. Indian
 * numbers are written many ways (`98765 43210`, `+91-98765-43210`,
 * `098765…`); all become `919876543210`. Null when there is no usable number.
 */
export function whatsAppLink(phone: string | null | undefined, text: string): string | null {
  let digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 11 || digits.length > 13) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
