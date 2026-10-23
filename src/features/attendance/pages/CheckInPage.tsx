import { useQuery } from '@tanstack/react-query';
import { CircleCheck, CircleX } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ApiError } from '@/lib/apiError';
import { formatDateTime } from '@/lib/format';

import { STATUS_LABELS } from '../constants';
import { deviceService } from '../services/deviceService';

/**
 * Where a scanned check-in code lands.
 *
 * The code on the classroom wall is an address — this page — carrying the
 * code itself. Opening it while signed in is the whole act of checking in:
 * the server works out who is asking from the session and marks *them*, so
 * there is nothing to fill in and nobody else to choose. Somebody not signed
 * in is sent to sign in first and comes straight back here.
 */
export default function CheckInPage() {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // A query rather than a mutation fired from an effect: it runs once per
  // code however many times the page renders, and reopening the page shows
  // what happened instead of trying again.
  const checkIn = useQuery({
    queryKey: ['attendance', 'check-in', token],
    queryFn: () => deviceService.checkIn(token),
    enabled: token !== '',
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    meta: { skipGlobalError: true },
  });

  const home = (
    <Button className="mt-6" onClick={() => navigate(PATHS.dashboard, { replace: true })}>
      Go to my dashboard
    </Button>
  );

  if (checkIn.isPending) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <Spinner />
        <p className="text-sm text-slate-500">Checking you in…</p>
      </div>
    );
  }

  if (checkIn.isError) {
    const expired = checkIn.error instanceof ApiError && checkIn.error.status === 410;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <CircleX className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          {expired ? 'This code has expired' : 'You were not checked in'}
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">{checkIn.error.message}</p>
        {home}
      </div>
    );
  }

  const { data: result, message } = checkIn.data;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CircleCheck className="size-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">{message}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {result.person_name} · {STATUS_LABELS[result.status]}
      </p>
      {result.checked_in_at && (
        <p className="mt-1 text-xs text-slate-500">{formatDateTime(result.checked_in_at)}</p>
      )}
      {home}
    </div>
  );
}
