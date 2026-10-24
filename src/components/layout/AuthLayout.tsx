import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Link, Outlet, useOutletContext } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Spinner } from '@/components/ui/Spinner';
import { env } from '@/config/env';
import { useSchool } from '@/features/saas/SchoolContext';
import { cn } from '@/lib/cn';

interface AuthLayoutContext {
  setWide: (wide: boolean) => void;
}

export function useAuthLayoutContext(): AuthLayoutContext {
  return useOutletContext<AuthLayoutContext>();
}

/**
 * Centred, chrome-free shell for guest screens (login, password reset).
 *
 * Branded with the school whose address this is, so a parent can see they
 * are signing in to the right one. Pages that need a wider container (the
 * demo accounts showcase) call `setWide(true)` via the outlet context.
 */
export function AuthLayout() {
  const { code, info } = useSchool();
  const name = info?.name ?? env.appName;
  const [wide, setWide] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className={cn('w-full transition-all duration-300', wide ? 'max-w-5xl' : 'max-w-sm')}>
        <Link
          to={PATHS.login}
          className="mx-auto mb-8 flex w-fit flex-col items-center rounded-lg text-center"
        >
          {info?.logo_url ? (
            <img
              src={info.logo_url}
              alt=""
              className="size-14 rounded-xl border border-slate-200 bg-white object-contain p-1"
            />
          ) : (
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="size-6" aria-hidden />
            </span>
          )}
          <h1 className="mt-3 text-lg font-semibold text-slate-900">{name}</h1>
          {code && (
            <p className="mt-0.5 font-mono text-xs text-slate-400">
              {window.location.host}/{code}
            </p>
          )}
        </Link>

        <Suspense
          fallback={
            <div className="flex justify-center py-10">
              <Spinner size="lg" className="text-brand-600" />
            </div>
          }
        >
          <Outlet context={{ setWide } satisfies AuthLayoutContext} />
        </Suspense>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          {/* The website is outside this school's app, so these are full page loads. */}
          <a
            href="/"
            className="inline-flex items-center gap-1 rounded font-medium text-slate-500 hover:text-brand-700"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {env.appName} home
          </a>
          <a href="/login" className="rounded font-medium text-slate-500 hover:text-brand-700">
            Not your school?
          </a>
        </div>
        <p>
          © {new Date().getFullYear()} {name}
        </p>
      </div>
    </div>
  );
}
