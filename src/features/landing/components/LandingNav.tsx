import { GraduationCap, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { env } from '@/config/env';
import { cn } from '@/lib/cn';

import { NAV_LINKS } from '../content';
import { useEntry } from '../hooks/useEntry';

import { CONTAINER } from './Section';

/** Sticky top bar: the name, jumps to each section, and the two ways in. */
export function LandingNav() {
  const { label, enter, startTrial } = useEntry();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className={cn(CONTAINER, 'flex h-16 items-center gap-3')}>
        <a href="#top" className="flex items-center gap-2.5 rounded-lg">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          <span className="text-base font-semibold text-slate-900">{env.appName}</span>
        </a>

        <nav aria-label="On this page" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Button variant="ghost" onClick={enter} leftIcon={<LogIn className="size-4" aria-hidden />}>
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">Sign in</span>
          </Button>
          <Button onClick={startTrial}>Start free trial</Button>
        </div>
      </div>
    </header>
  );
}
