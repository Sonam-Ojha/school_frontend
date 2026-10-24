import { Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';

import { useIsSchoolAdmin } from '../hooks/useSubscription';
import { MODULE_LABELS } from '../modules';
import type { ModuleKey } from '../types';

/**
 * In place of a page whose module the school's plan leaves out. The API
 * refuses its data anyway; this says why, instead of a page of errors.
 */
export function ModuleUnavailable({ module }: { module: ModuleKey }) {
  const isAdmin = useIsSchoolAdmin();
  const name = MODULE_LABELS[module];

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Lock className="size-7" aria-hidden />
      </span>
      <h1 className="mt-5 text-xl font-semibold text-slate-900">{name} is not part of your plan</h1>
      <p className="mt-2 text-sm text-slate-500">
        {isAdmin
          ? `Upgrade the school’s plan to switch ${name.toLowerCase()} on for everybody. Your records stay as they are.`
          : `Your school’s current plan does not include ${name.toLowerCase()}. Ask your School Admin if you need it.`}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {isAdmin && (
          <Link
            to={PATHS.subscription}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <Sparkles className="size-4" aria-hidden />
            See plans
          </Link>
        )}
        <Link
          to={PATHS.dashboard}
          className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to the dashboard
        </Link>
      </div>
    </div>
  );
}
