import '@tanstack/react-query';

/**
 * Types the `meta` bag so opting out of the global error toast is checked by
 * the compiler instead of relying on a magic string.
 */
declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      /** Suppress the global "could not refresh data" toast for this query. */
      skipGlobalError?: boolean;
    };
    mutationMeta: {
      /** Suppress the global "action failed" toast — the caller reports it. */
      skipGlobalError?: boolean;
    };
  }
}
