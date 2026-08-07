import { useEffect, type RefObject } from 'react';

/**
 * Close an open popover when the user clicks away or presses Escape.
 *
 * Extracted once a fifth dropdown wanted it — the account menu, the
 * multi-select, both export menus and the notification bell had the same
 * effect written out verbatim, which is five places to fix the day somebody
 * notices a missing listener teardown.
 *
 * `mousedown` rather than `click`: a click fires after the button inside the
 * panel has already been re-rendered away, so a menu item that navigates
 * would close the panel before its own handler ran.
 */
export function useDismiss(
  isOpen: boolean,
  containerRef: RefObject<HTMLElement | null>,
  close: () => void,
): void {
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, containerRef, close]);
}
