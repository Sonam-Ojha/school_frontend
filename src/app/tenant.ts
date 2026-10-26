import { storage } from '@/lib/storage';

import { PATHS } from './router/paths';

/**
 * Which part of the product this page load is, read once from the address.
 *
 * The first segment of the path decides:
 *
 * - `/`, `/signup`, `/login`…      the public website (pricing, sign-up, find your school);
 * - `/superadmin/…`                the platform console, for whoever runs the service;
 * - `/<school-code>/…`             one school's application: `/greenwood/students`.
 *
 * Each is its own router with its own base path, so inside a school every
 * link the app already uses (`/students/12`) lands under that school's code
 * without being rewritten. Moving between them — from the website into a
 * school — is a full page load, which also means no session, cache or store
 * can leak from one school into another.
 */

export type Area =
  | { kind: 'public' }
  | { kind: 'platform' }
  | { kind: 'school'; code: string }
  /** An address from before schools had codes, such as `/students/12`. */
  | { kind: 'legacy'; path: string };

export const PLATFORM_SEGMENT = 'superadmin';

/** Pages of the public website. */
/** The website's own pages. A school can never take one of these as its code. */
export const PUBLIC_SEGMENTS = new Set(['', 'signup', 'login', 'pricing', 'features', 'about', 'contact']);

/** The first segment of every page inside a school, so an old link without a code is recognised. */
const SCHOOL_SECTIONS = new Set(
  Object.values(PATHS)
    .map((path) => path.split('/')[1] ?? '')
    .filter(Boolean),
);

/**
 * Words no school can take as its code: they are pages of the website, the
 * console, or the server. The server keeps the same list.
 */
export const RESERVED_CODES = new Set([
  ...PUBLIC_SEGMENTS,
  ...SCHOOL_SECTIONS,
  PLATFORM_SEGMENT,
  'admin',
  'api',
  'app',
  'assets',
  'billing',
  'iclock',
  'health',
  'up',
  'www',
  'static',
  's',
  't',
]);

/** Lower-case letters, digits and single hyphens; 3 to 40 characters. */
export const SCHOOL_CODE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

export function isValidSchoolCode(code: string): boolean {
  return SCHOOL_CODE_PATTERN.test(code) && !code.includes('--') && !RESERVED_CODES.has(code);
}

export function resolveArea(pathname: string): Area {
  const first = decodeURIComponent(pathname.split('/')[1] ?? '').toLowerCase();

  if (PUBLIC_SEGMENTS.has(first)) return { kind: 'public' };
  if (first === PLATFORM_SEGMENT) return { kind: 'platform' };
  if (SCHOOL_SECTIONS.has(first)) return { kind: 'legacy', path: pathname };
  if (isValidSchoolCode(first)) return { kind: 'school', code: first };
  // Not a page and not a code anybody could have: the website's 404.
  return { kind: 'public' };
}

export const area: Area = resolveArea(window.location.pathname);

/** The school this page belongs to, or null outside a school. */
export const schoolCode: string | null = area.kind === 'school' ? area.code : null;

/** The address of a page inside a school: `schoolUrl('greenwood', '/students')` → `/greenwood/students`. */
export function schoolUrl(code: string, path = '/'): string {
  return `/${code}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/$/, '') || `/${code}`;
}

export const platformUrl = (path = '/'): string => `/${PLATFORM_SEGMENT}${path === '/' ? '' : path}`;

const LAST_SCHOOL_KEY = 'school-erp.last-school';

/** Remembered on this device so "Sign in" can offer the school used last. */
export function rememberSchool(code: string): void {
  storage.set(LAST_SCHOOL_KEY, code);
}

export function lastSchool(): string | null {
  const code = storage.get<string | null>(LAST_SCHOOL_KEY, null);
  return code && isValidSchoolCode(code) ? code : null;
}

export function forgetSchool(): void {
  storage.remove(LAST_SCHOOL_KEY);
}
