import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * The part of a sidebar entry that opens out on hover.
 *
 * On a desktop a sidebar rests as a rail of icons and opens out while the
 * pointer is on it (or a key has moved focus into it), folding back when it
 * leaves; the page beside it slides across as it does. `rail` is that mode;
 * the mobile drawer always shows everything.
 *
 * Its column grows from nothing to the width of what it holds (a grid track
 * animates where `width: auto` cannot), so the sidebar glides to exactly the
 * width of its longest entry and back, while the words fade in and out. The
 * sidebar it sits in must carry the `group` class.
 */
export function Reveal({ rail, children, className }: { rail: boolean; children: ReactNode; className?: string }) {
  if (!rail) return <span className={className}>{children}</span>;
  return (
    <span
      className={cn(
        'grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-300 ease-out motion-reduce:transition-none',
        'group-hover:grid-cols-[1fr] group-hover:opacity-100 group-focus-within:grid-cols-[1fr] group-focus-within:opacity-100',
      )}
    >
      <span className={cn('min-w-0 overflow-hidden', className)}>{children}</span>
    </span>
  );
}
