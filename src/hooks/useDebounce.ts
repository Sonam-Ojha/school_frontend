import { useEffect, useState } from 'react';

import { SEARCH_DEBOUNCE_MS } from '@/config/constants';

/**
 * Delay propagating a fast-changing value. Used to keep search-as-you-type
 * from firing a request per keystroke.
 */
export function useDebounce<T>(value: T, delay: number = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
