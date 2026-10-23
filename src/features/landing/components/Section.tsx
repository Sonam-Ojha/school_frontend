import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface SectionProps {
  /** Anchor the navbar links to. */
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
}

/** Shared width for everything on the landing page, navbar included. */
export const CONTAINER = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

/**
 * One band of the landing page: a short label, a heading, an optional lead
 * paragraph, then the content. `scroll-mt` keeps the heading clear of the
 * sticky navbar when a link jumps here.
 */
export function Section({ id, eyebrow, title, lead, children, className }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn('scroll-mt-16 py-16 sm:py-20', className)}
    >
      <div className={CONTAINER}>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>
          <h2
            id={`${id}-title`}
            className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            {title}
          </h2>
          {lead && <p className="mt-3 text-base text-slate-600">{lead}</p>}
        </div>

        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
