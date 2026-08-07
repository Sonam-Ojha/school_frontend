import { GraduationCap } from 'lucide-react';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { Spinner } from '@/components/ui/Spinner';
import { env } from '@/config/env';

/** Centred, chrome-free shell for guest screens (login, password reset). */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap className="size-6" aria-hidden />
          </span>
          <h1 className="mt-3 text-lg font-semibold text-slate-900">{env.appName}</h1>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-10">
              <Spinner size="lg" className="text-brand-600" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        © {new Date().getFullYear()} {env.appName}
      </p>
    </div>
  );
}
