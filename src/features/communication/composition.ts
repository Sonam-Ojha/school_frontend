/**
 * Message composition: what a body costs to send, and how its placeholders
 * resolve.
 *
 * Both are pure so the compose screen counting segments as somebody types and
 * the server billing for them cannot disagree — and so a template's cost can
 * be shown before anybody sends nine hundred of it.
 */

// --- SMS segmentation -------------------------------------------------------

/**
 * The GSM 03.38 basic alphabet.
 *
 * Anything outside it forces the whole message into UCS-2, which more than
 * halves what fits — one stray curly quote pasted from a word processor turns
 * a one-segment message into a three-segment one, and that is the bill.
 */
const GSM_BASIC =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?' +
  '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';

/** These count as two characters each in GSM-7. */
const GSM_EXTENDED = '^{}\\[~]|€';

export const GSM_SINGLE_LIMIT = 160;
export const GSM_CONCAT_LIMIT = 153;
export const UCS2_SINGLE_LIMIT = 70;
export const UCS2_CONCAT_LIMIT = 67;

export type SmsEncoding = 'GSM-7' | 'UCS-2';

export interface SmsCost {
  encoding: SmsEncoding;
  /** Billable units, which is not the same as the string's length. */
  characters: number;
  segments: number;
  /** How much of the current segment is still free. */
  remaining: number;
  /** The first character that forced UCS-2, if one did. */
  forcedBy: string | null;
}

/**
 * What one SMS body costs.
 *
 * Concatenated messages are shorter per segment than a single one, because
 * each part carries a header saying which part it is — so 161 characters is
 * two segments of 153, not 160 plus 1.
 */
export function smsCost(body: string): SmsCost {
  let characters = 0;
  let forcedBy: string | null = null;

  for (const character of body) {
    if (GSM_EXTENDED.includes(character)) {
      characters += 2;
      continue;
    }
    if (GSM_BASIC.includes(character)) {
      characters += 1;
      continue;
    }

    forcedBy ??= character;
    characters += 1;
  }

  const isUnicode = forcedBy !== null;
  // A unicode body is counted in UTF-16 code units, so an emoji is two.
  if (isUnicode) characters = body.length;

  const single = isUnicode ? UCS2_SINGLE_LIMIT : GSM_SINGLE_LIMIT;
  const concat = isUnicode ? UCS2_CONCAT_LIMIT : GSM_CONCAT_LIMIT;

  if (characters === 0) {
    return {
      encoding: isUnicode ? 'UCS-2' : 'GSM-7',
      characters: 0,
      segments: 0,
      remaining: single,
      forcedBy,
    };
  }

  const segments = characters <= single ? 1 : Math.ceil(characters / concat);
  const capacity = segments === 1 ? single : segments * concat;

  return {
    encoding: isUnicode ? 'UCS-2' : 'GSM-7',
    characters,
    segments,
    remaining: capacity - characters,
    forcedBy,
  };
}

// --- placeholders -----------------------------------------------------------

/** `{{student_name}}` — deliberately the only syntax, so nothing else is one. */
const PLACEHOLDER = /\{\{\s*([a-z0-9_]+)\s*\}\}/gi;

/** Every placeholder a body uses, in the order they first appear. */
export function extractPlaceholders(body: string): string[] {
  const found: string[] = [];

  for (const match of body.matchAll(PLACEHOLDER)) {
    const key = match[1].toLowerCase();
    if (!found.includes(key)) found.push(key);
  }

  return found;
}

export interface RenderResult {
  body: string;
  /** Placeholders the body used that no value was supplied for. */
  missing: string[];
}

/**
 * Fill a template.
 *
 * An unresolved placeholder is left in place rather than blanked, and
 * reported — a message that goes out saying "Dear ," is worse than one that
 * never goes out, and silently dropping the token hides which value was
 * missing.
 */
export function renderTemplate(body: string, values: Record<string, string>): RenderResult {
  const missing: string[] = [];

  const rendered = body.replace(PLACEHOLDER, (token, rawKey: string) => {
    const key = rawKey.toLowerCase();
    const value = values[key];

    if (value === undefined || value === '') {
      if (!missing.includes(key)) missing.push(key);
      return token;
    }

    return value;
  });

  return { body: rendered, missing };
}

/**
 * The placeholders this school's data can fill.
 *
 * Offered on the compose screen so somebody writing a template picks from
 * what exists rather than inventing a token nothing will ever resolve.
 */
export const AVAILABLE_PLACEHOLDERS: { key: string; label: string; example: string }[] = [
  { key: 'student_name', label: 'Student name', example: 'Aarav Sharma' },
  { key: 'admission_no', label: 'Admission number', example: 'ADM-2025-0041' },
  { key: 'class_name', label: 'Class', example: 'Class 8 — A' },
  { key: 'guardian_name', label: 'Guardian name', example: 'Ramesh Sharma' },
  { key: 'school_name', label: 'School name', example: 'Greenwood International' },
  { key: 'date', label: "Today's date", example: '12 Aug 2026' },
  { key: 'amount', label: 'Amount', example: '4,500' },
  { key: 'due_date', label: 'Due date', example: '15 Aug 2026' },
];
