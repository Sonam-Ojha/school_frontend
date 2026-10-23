import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Building2, PlayCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { isValidSchoolCode, lastSchool, schoolUrl } from '@/app/tenant';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';

import { WebsiteShell } from '../components/WebsiteShell';
import { saasService } from '../services/saasService';

/**
 * `/login`: every school signs in at its own address (`/greenwood/login`),
 * so the website's sign-in asks which school first. The school used last on
 * this device is offered with one click.
 */
export default function FindSchoolPage() {
  const [params] = useSearchParams();
  const next = params.get('next') ?? '';
  const remembered = lastSchool();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const config = useQuery({
    queryKey: queryKeys.saas.config(),
    queryFn: ({ signal }) => saasService.config(signal),
    staleTime: 10 * 60_000,
    meta: { skipGlobalError: true },
  });
  const demo = config.data?.demo_school ?? null;

  const open = (target: string) => {
    // A path from an old link (`/students/12`) is carried into the school.
    const path = next.startsWith('/') && !next.startsWith('//') ? next : '/login';
    window.location.assign(schoolUrl(target, path));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const wanted = code.trim().toLowerCase();
    if (!isValidSchoolCode(wanted)) {
      setError('A school code is 3 to 40 letters, numbers or hyphens, like "greenwood".');
      return;
    }

    setChecking(true);
    setError(null);
    try {
      await saasService.school(wanted);
      open(wanted);
    } catch (caught) {
      setChecking(false);
      setError(
        caught instanceof ApiError && caught.code === 'school_not_found'
          ? `No school uses the code "${wanted}". Check it with your school office.`
          : caught instanceof Error
            ? caught.message
            : 'The school could not be looked up. Please try again.',
      );
    }
  };

  return (
    <WebsiteShell>
      <Card>
        <CardBody className="space-y-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Sign in to your school</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your school&rsquo;s code. You will find it in the address your school gave you.
            </p>
          </div>

          {remembered && (
            <button
              type="button"
              onClick={() => open(remembered)}
              className="flex w-full items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-left transition-colors hover:bg-brand-100"
            >
              <Building2 className="size-5 shrink-0 text-brand-600" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900">Continue to {remembered}</span>
                <span className="block truncate text-xs text-slate-500">{window.location.host}/{remembered}</span>
              </span>
              <ArrowRight className="size-4 text-brand-600" aria-hidden />
            </button>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {error && <Alert tone="danger">{error}</Alert>}
            <div className="space-y-1.5">
              <label htmlFor="school-code" className="text-sm font-medium text-slate-700">
                School code
              </label>
              <div className="flex items-center gap-2">
                <span className="hidden shrink-0 text-sm text-slate-400 sm:inline">{window.location.host}/</span>
                <Input
                  id="school-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\s/g, '').toLowerCase())}
                  placeholder="greenwood"
                  autoComplete="organization"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoFocus={!remembered}
                />
              </div>
            </div>
            <Button type="submit" fullWidth size="lg" isLoading={checking} rightIcon={<ArrowRight className="size-4" />}>
              Continue
            </Button>
          </form>

          {demo && (
            <button
              type="button"
              onClick={() => open(demo.code)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
            >
              <PlayCircle className="size-4" aria-hidden />
              Just looking? Open the live demo school
            </button>
          )}
        </CardBody>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{' '}
        <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
          Start a free trial for your school
        </Link>
      </p>
    </WebsiteShell>
  );
}
