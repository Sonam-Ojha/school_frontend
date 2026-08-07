import { useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query.
 *
 * `useSyncExternalStore` keeps this tear-free under React 19 concurrent
 * rendering, unlike the usual useState + useEffect pairing.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false, // SSR/prerender: assume mobile-first
  );
}

/** Tailwind's `lg` breakpoint — the point the sidebar becomes permanent. */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
