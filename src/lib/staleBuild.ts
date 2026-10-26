/**
 * The app is split into files that load as they are needed. When a new
 * version is published (or the dev server re-bundles), a page that was
 * already open still asks for the old files, which are gone — and the
 * browser reports "Failed to fetch dynamically imported module". A reload
 * picks up the current files. It is done once: if the files still cannot be
 * fetched a minute later, the problem is real (the server is down), and the
 * error is shown rather than reloading in a loop.
 */

/** What browsers say when a code-split file cannot be fetched (Chrome, Firefox, Safari, Vite). */
const STALE =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|Loading chunk \S+ failed/i;

export const isStaleBuildError = (error: unknown): boolean =>
  error instanceof Error && STALE.test(error.message);

const KEY = 'stale-build-reloaded-at';

/** Whether a reload may be tried: not when one was tried in the last minute, or cannot be remembered. */
export function canReloadForNewBuild(): boolean {
  try {
    return Date.now() - Number(sessionStorage.getItem(KEY) ?? 0) >= 60_000;
  } catch {
    // Without storage a reload could not tell it had already been tried: show the error instead.
    return false;
  }
}

/** Reloads the page to pick up the current files. False when that was just tried, or cannot be remembered. */
export function reloadForNewBuild(): boolean {
  if (!canReloadForNewBuild()) return false;
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/**
 * For `lazy()` and route `lazy`: tries the import again after a moment (a
 * dev server or network that blinked), then reloads the page for the
 * current files. Any other failure is passed on unchanged.
 */
export async function importFresh<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (first) {
    if (!isStaleBuildError(first)) throw first;
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    try {
      return await load();
    } catch (second) {
      // The page is reloading: wait for it rather than show an error for a moment.
      if (reloadForNewBuild()) return new Promise<T>(() => undefined);
      throw second;
    }
  }
}

/** Vite's own signal that a file it was preloading has gone: reload instead of failing. */
export function reloadOnPreloadError(): void {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewBuild()) event.preventDefault();
  });
}
