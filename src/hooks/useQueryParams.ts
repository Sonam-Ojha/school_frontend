import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** A key set to `undefined` or `''` is removed, not written as empty. */
export type QueryPatch = Record<string, string | number | undefined>;

/**
 * Read and update filter state in the query string.
 *
 * Extracted after the same closure — build a `URLSearchParams` from the
 * current one, delete the blanks, set the rest, replace rather than push —
 * had been written out in eleven screens. Replacing rather than pushing is
 * the part worth centralising: changing a filter should not put an entry in
 * the browser history, or Back walks the user through every dropdown they
 * touched instead of returning them to the previous page.
 *
 * The updater form of `setSearchParams` is used so two patches in the same
 * tick compose rather than the second overwriting the first — which is what
 * happens when a class picker clears its section alongside setting the class.
 */
export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const patch = useCallback(
    (updates: QueryPatch) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === '') next.delete(key);
            else next.set(key, String(value));
          }

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  /** Replace everything, for when a screen switches to an unrelated view. */
  const reset = useCallback(
    (next: QueryPatch = {}) => {
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === '') continue;
        params.set(key, String(value));
      }

      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  return { searchParams, patch, reset };
}
