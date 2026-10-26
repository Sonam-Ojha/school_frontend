import { BrandLogo } from '@/components/brand/BrandLogo';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { env } from '@/config/env';
import { cn } from '@/lib/cn';

interface WebsiteShellProps {
  children: ReactNode;
  /** `wide` for a page with a form and a column beside it, such as sign-up. */
  width?: 'narrow' | 'wide';
}

/**
 * The frame of the website's own pages (find your school, sign up): the
 * brand back to the home page, the content, and a short footer.
 */
export function WebsiteShell({ children, width = 'narrow' }: WebsiteShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center rounded-lg" aria-label={`${env.appName} — home`}>
            <BrandLogo />
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium">
            <Link to="/#pricing" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Pricing
            </Link>
            <Link to="/login" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-10 sm:py-14">
        <div className={cn('w-full', width === 'wide' ? 'max-w-5xl' : 'max-w-md')}>{children}</div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {env.appName}
          </p>
          <a href="/superadmin/login" className="hover:text-slate-700">
            Platform administration
          </a>
        </div>
      </footer>
    </div>
  );
}
