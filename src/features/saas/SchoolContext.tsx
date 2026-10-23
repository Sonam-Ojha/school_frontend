import { useQuery } from '@tanstack/react-query';
import { Building2, Search } from 'lucide-react';
import { createContext, useContext, useEffect, type ReactNode } from 'react';

import { rememberSchool, schoolCode } from '@/app/tenant';
import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { ApiError } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';

import { saasService } from './services/saasService';
import type { SchoolInfo } from './types';

interface SchoolContextValue {
  code: string;
  /** Null while unknown: a server without the platform in front of it has no such record. */
  info: SchoolInfo | null;
}

const SchoolContext = createContext<SchoolContextValue | null>(null);

/** The school this page belongs to. */
export function useSchool(): SchoolContextValue {
  return useContext(SchoolContext) ?? { code: schoolCode ?? '', info: null };
}

/**
 * Looks up the school named in the address before anything else in it
 * renders. An unknown code gets a page saying so, instead of a sign-in form
 * that could never work. Any other failure lets the app carry on: the school
 * may still answer, and its own pages report their own errors.
 */
export function SchoolGate({ code, children }: { code: string; children: ReactNode }) {
  const query = useQuery({
    queryKey: queryKeys.saas.school(code),
    queryFn: ({ signal }) => saasService.school(code, signal),
    staleTime: 5 * 60_000,
    retry: (failures, error) => failures < 2 && error instanceof ApiError && error.isRetryable,
    meta: { skipGlobalError: true },
  });

  const found = query.isSuccess;
  useEffect(() => {
    if (found) rememberSchool(code);
  }, [found, code]);

  if (query.isPending) return <FullPageLoader label="Opening your school…" />;

  if (query.error instanceof ApiError && query.error.code === 'school_not_found') {
    return <SchoolNotFound code={code} />;
  }

  return (
    <SchoolContext.Provider value={{ code, info: query.data ?? null }}>{children}</SchoolContext.Provider>
  );
}

function SchoolNotFound({ code }: { code: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
        <Building2 className="size-7" aria-hidden />
      </span>
      <h1 className="mt-5 text-xl font-semibold text-slate-900">School not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        No school uses the code <span className="font-mono font-medium text-slate-700">{code}</span>. Check the
        address, or look your school up by its code.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <a
          href="/login"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Search className="size-4" aria-hidden />
          Find my school
        </a>
        <a
          href="/"
          className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Go to the website
        </a>
      </div>
    </div>
  );
}
