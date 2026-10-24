import { GraduationCap, LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { env } from '@/config/env';
import { cn } from '@/lib/cn';

import { NAV_LINKS } from '../content';
import { useEntry } from '../hooks/useEntry';

import { CONTAINER } from './Section';

/** Sticky top bar — dark, with blur backdrop, hamburger on mobile. */
export function LandingNav() {
  const { label, enter, startTrial } = useEntry();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
      <div className={cn(CONTAINER, 'flex h-16 items-center gap-3')}>
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5 rounded-lg">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.5)]">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          <span className="text-base font-semibold text-white">{env.appName}</span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="On this page" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Button
            variant="ghost"
            onClick={enter}
            leftIcon={<LogIn className="size-4" aria-hidden />}
            className="hidden text-slate-300 hover:text-white sm:inline-flex"
          >
            {label}
          </Button>
          <Button
            onClick={startTrial}
            className="bg-brand-600 hover:bg-brand-500 shadow-[0_0_16px_rgba(99,102,241,0.3)]"
          >
            Start free trial
          </Button>

          {/* Hamburger */}
          <button
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 flex size-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/10 lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-4 pb-4 lg:hidden">
          <nav className="mt-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <button
                onClick={() => { enter(); setMobileOpen(false); }}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
              >
                <LogIn className="size-4" />
                {label}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
