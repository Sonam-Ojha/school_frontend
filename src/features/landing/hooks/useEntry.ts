import { lastSchool, schoolUrl } from '@/app/tenant';

/**
 * Where the website's sign-in buttons lead. Every school signs in at its own
 * address, so with no school remembered on this device the answer is the
 * page that asks for the school's code. These are full page loads: each
 * school's app is separate from the website.
 */
export function useEntry() {
  const remembered = lastSchool();

  return {
    remembered,
    label: remembered ? `Open ${remembered}` : 'Sign in',
    enter: () => window.location.assign(remembered ? schoolUrl(remembered, '/dashboard') : '/login'),
    startTrial: () => window.location.assign('/signup'),
  };
}
