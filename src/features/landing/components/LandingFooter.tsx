import { GraduationCap } from 'lucide-react';

import { env } from '@/config/env';
import { cn } from '@/lib/cn';

import { CONTAINER } from './Section';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div
        className={cn(
          CONTAINER,
          'flex flex-col items-center justify-between gap-3 py-6 text-sm text-slate-500 sm:flex-row',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand-600 text-white">
            <GraduationCap className="size-4" aria-hidden />
          </span>
          <span className="font-medium text-slate-700">{env.appName}</span>
        </div>
        <nav className="flex gap-4">
          <a href="/login" className="hover:text-slate-700">Sign in</a>
          <a href="/signup" className="hover:text-slate-700">Start free trial</a>
          <a href="/superadmin/login" className="hover:text-slate-700">Platform admin</a>
        </nav>
        <p>
          © {new Date().getFullYear()} {env.appName}
        </p>
      </div>
    </footer>
  );
}
