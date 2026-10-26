import { Menu, PlayCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { env } from '@/config/env';
import { cn } from '@/lib/cn';

import { NAV_LINKS } from '../content';
import { useEntry } from '../hooks/useEntry';

import { CONTAINER } from './Section';

/** Sticky top bar — dark, with blur backdrop, hamburger on mobile. */
export function LandingNav() {
  const { startTrial } = useEntry();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-200',
        scrolled
          ? 'border-white/10 bg-slate-950/90 backdrop-blur-lg shadow-[0_1px_20px_rgba(0,0,0,0.3)]'
          : 'border-white/5 bg-slate-950/80 backdrop-blur-md',
      )}
    >
      <div className={cn(CONTAINER, 'flex h-16 items-center gap-3')}>
        {/* Logo */}
        <a href="/" className="flex items-center rounded-lg" aria-label={`${env.appName} — home`}>
          <BrandLogo tone="dark" />
        </a>

        {/* Desktop nav */}
        <nav aria-label="Site navigation" className="ml-auto hidden items-center gap-1 lg:flex">
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
          <a
            href="/sunrise/login"
            className="hidden items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:inline-flex"
          >
            <PlayCircle className="size-4 text-brand-400" aria-hidden />
            Live Demo
          </a>
          <Button
            onClick={startTrial}
            className="bg-brand-600 hover:bg-brand-500 shadow-[0_0_16px_rgba(87,80,251,0.3)]"
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
              <a
                href="/sunrise/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
              >
                <PlayCircle className="size-4 text-brand-400" />
                Live Demo
              </a>
              <Button
                fullWidth
                onClick={() => { startTrial(); setMobileOpen(false); }}
                className="bg-brand-600 hover:bg-brand-500"
              >
                Start free trial
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
