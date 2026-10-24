import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Content that exists only on paper: hidden on screen, and the one thing the
 * print rules reveal (`print-target`). Rendered at the top of the document,
 * outside dialogs and scroll containers, so `window.print()` gets it whole
 * whatever is open on screen at the time.
 */
export function PrintOnly({ children }: { children: ReactNode }) {
  return createPortal(<div className="print-target hidden print:block">{children}</div>, document.body);
}
