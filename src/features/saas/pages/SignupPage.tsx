import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, CircleCheck, CircleX, Loader2, School } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { isValidSchoolCode, schoolUrl } from '@/app/tenant';
import { Form } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { ApiError } from '@/lib/apiError';
import { formatDate } from '@/lib/format';
import { applyServerErrors } from '@/lib/formErrors';
import { queryKeys } from '@/lib/queryKeys';

import { CycleToggle, PlanCard, yearlySaving } from '../components/PlanCard';
import { WebsiteShell } from '../components/WebsiteShell';
import { saasService } from '../services/saasService';
import type { SignupResult } from '../types';

const signupSchema = z.object({
  school_name: z.string().trim().min(3, 'Enter your school’s name.').max(150, 'Keep the name under 150 characters.'),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .refine(isValidSchoolCode, 'Use 3–40 lower-case letters, numbers and single hyphens, e.g. "greenwood".'),
  city: z.string().trim().min(2, 'Enter the city.').max(80),
  state: z.string().trim().max(80),
  contact_name: z.string().trim().min(2, 'Enter your name.').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number.'),
  password: z
    .string()
    .min(8, 'At least 8 characters.')
    .max(72, 'At most 72 characters.')
    .regex(/[A-Za-z]/, 'Include at least one letter.')
    .regex(/[0-9]/, 'Include at least one number.'),
  plan_id: z.number({ invalid_type_error: 'Choose a plan.' }).int().positive('Choose a plan.'),
  billing_cycle: z.enum(['monthly', 'yearly']),
  sample_data: z.boolean(),
  accept: z.boolean().refine((value) => value, 'Please accept the terms to continue.'),
});

type SignupForm = z.infer<typeof signupSchema>;

const FIELDS = [
  'school_name', 'code', 'city', 'state', 'contact_name', 'email', 'phone', 'password', 'plan_id', 'billing_cycle',
] as const;

/** "St. Mary's Convent School, Pune" → "st-marys-convent-school-pune", trimmed to fit. */
function suggestCode(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
}

/**
 * `/signup`: a school starts its free trial. The platform creates the school
 * — its own database tables, roles and the administrator's account — while
 * the visitor waits, then sends them to their school's own sign-in page.
 */
export default function SignupPage() {
  const plans = useQuery({
    queryKey: queryKeys.saas.plans(),
    queryFn: ({ signal }) => saasService.plans(signal),
    staleTime: 10 * 60_000,
  });
  const config = useQuery({
    queryKey: queryKeys.saas.config(),
    queryFn: ({ signal }) => saasService.config(signal),
    staleTime: 10 * 60_000,
    meta: { skipGlobalError: true },
  });

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      school_name: '',
      code: '',
      city: '',
      state: '',
      contact_name: '',
      email: '',
      phone: '',
      password: '',
      plan_id: 0,
      billing_cycle: 'yearly',
      sample_data: true,
      accept: false,
    },
  });

  // The featured plan is chosen to begin with; the visitor can change it.
  const planId = useWatch({ control: form.control, name: 'plan_id' });
  useEffect(() => {
    if (planId || !plans.data?.length) return;
    const featured = plans.data.find((plan) => plan.is_featured) ?? plans.data[0];
    if (featured) form.setValue('plan_id', featured.id);
  }, [plans.data, planId, form]);

  // The code follows the name until the visitor types one of their own.
  const name = useWatch({ control: form.control, name: 'school_name' });
  const code = useWatch({ control: form.control, name: 'code' });
  const codeTouched = useRef(false);
  useEffect(() => {
    if (codeTouched.current) return;
    form.setValue('code', suggestCode(name ?? ''), { shouldValidate: false });
  }, [name, form]);

  const debouncedCode = useDebounce((code ?? '').trim().toLowerCase(), 400);
  const availability = useQuery({
    queryKey: [...queryKeys.saas.all, 'check-code', debouncedCode],
    queryFn: ({ signal }) => saasService.checkCode(debouncedCode, signal),
    enabled: isValidSchoolCode(debouncedCode),
    staleTime: 30_000,
    meta: { skipGlobalError: true },
  });

  const cycle = useWatch({ control: form.control, name: 'billing_cycle' });
  const [created, setCreated] = useState<SignupResult | null>(null);

  const signup = useMutation({
    mutationFn: saasService.signup,
    meta: { skipGlobalError: true },
  });

  const onSubmit = (values: SignupForm) => {
    const { accept: _accept, ...input } = values;
    signup.mutate(input, {
      onSuccess: setCreated,
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', {
          type: 'server',
          message:
            error instanceof ApiError && error.status === 429
              ? error.message
              : error instanceof Error
                ? error.message
                : 'The school could not be created. Please try again.',
        });
      },
    });
  };

  if (created) return <SignupDone result={created} />;

  const saving = Math.max(0, ...(plans.data ?? []).map(yearlySaving));
  const trialDays = config.data?.trial_days ?? 14;
  const closed = config.data?.signup_enabled === false;

  return (
    <WebsiteShell width="wide">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Start your {trialDays}-day free trial
        </h1>
        <p className="mt-2 text-slate-600">
          Every module, your own private workspace, no card needed. Your school is ready in under a minute.
        </p>
      </div>

      {closed ? (
        <Alert tone="warning" className="mx-auto mt-8 max-w-xl" title="Sign-up is closed">
          New schools are being added by our team for now. Leave your details on the home page and we will be in
          touch.
        </Alert>
      ) : (
        <Form form={form} onSubmit={onSubmit} className="mt-10 space-y-8">
          <section aria-labelledby="plan-title" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="plan-title" className="text-base font-semibold text-slate-900">
                1. Choose a plan
              </h2>
              <CycleToggle value={cycle} onChange={(next) => form.setValue('billing_cycle', next)} saving={saving} />
            </div>
            {plans.isPending ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((key) => (
                  <Skeleton key={key} className="h-80" />
                ))}
              </div>
            ) : plans.isError ? (
              <Alert tone="danger">The plans could not be loaded. {plans.error.message}</Alert>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {plans.data.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    cycle={cycle}
                    selected={planId === plan.id}
                    onSelect={() => form.setValue('plan_id', plan.id, { shouldValidate: true })}
                  />
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500">
              You will not be charged during the trial. Pick a plan now; you can change it any time before paying.
            </p>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardBody className="space-y-4">
                <h2 className="text-base font-semibold text-slate-900">2. Your school</h2>
                <FormInput<SignupForm> name="school_name" label="School name" placeholder="Greenwood International School" required />
                <div className="space-y-1.5">
                  <FormInput<SignupForm>
                    name="code"
                    label="School address"
                    placeholder="greenwood"
                    hint={`Your school will be at ${window.location.host}/${code || 'your-code'}`}
                    onChange={() => {
                      codeTouched.current = true;
                    }}
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                  />
                  <CodeAvailability
                    code={debouncedCode}
                    checking={availability.isFetching}
                    result={availability.data}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput<SignupForm> name="city" label="City" placeholder="Pune" required />
                  <FormInput<SignupForm> name="state" label="State" placeholder="Maharashtra" />
                </div>
                <FormCheckbox<SignupForm>
                  name="sample_data"
                  label="Fill my school with sample data"
                  description="Classes, students, fees and exams to explore with. You can start fresh later."
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-4">
                <h2 className="text-base font-semibold text-slate-900">3. Your administrator account</h2>
                <FormInput<SignupForm> name="contact_name" label="Your name" placeholder="Anita Sharma" autoComplete="name" required />
                <FormInput<SignupForm> name="email" type="email" label="Email" placeholder="principal@greenwood.edu.in" autoComplete="email" required />
                <FormInput<SignupForm> name="phone" type="tel" label="Phone" placeholder="98765 43210" autoComplete="tel" required />
                <FormInput<SignupForm>
                  name="password"
                  type="password"
                  label="Password"
                  hint="At least 8 characters, with a letter and a number."
                  autoComplete="new-password"
                  required
                />
              </CardBody>
            </Card>
          </div>

          <div className="flex flex-col items-center gap-4">
            <FormCheckbox<SignupForm>
              name="accept"
              label="I agree to the terms of service and privacy policy"
            />
            <Button
              type="submit"
              size="lg"
              className="min-w-64"
              isLoading={signup.isPending}
              rightIcon={<ArrowRight className="size-4" />}
            >
              Create my school
            </Button>
            {signup.isPending && (
              <p className="flex items-center gap-2 text-sm text-slate-500" role="status">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Setting up your school&rsquo;s database, roles and administrator account…
              </p>
            )}
            <p className="text-sm text-slate-500">
              Already have a school?{' '}
              <Link to="/login" className="font-medium text-brand-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Form>
      )}
    </WebsiteShell>
  );
}

function CodeAvailability({
  code,
  checking,
  result,
}: {
  code: string;
  checking: boolean;
  result: { available: boolean; reason: string | null } | undefined;
}) {
  if (!isValidSchoolCode(code)) return null;
  if (checking && !result) {
    return <p className="text-xs text-slate-500">Checking…</p>;
  }
  if (!result) return null;
  return result.available ? (
    <p className="flex items-center gap-1 text-xs font-medium text-emerald-700">
      <CircleCheck className="size-3.5" aria-hidden /> {code} is available
    </p>
  ) : (
    <p className="flex items-center gap-1 text-xs font-medium text-red-600">
      <CircleX className="size-3.5" aria-hidden /> {result.reason ?? 'That address is taken.'}
    </p>
  );
}

function SignupDone({ result }: { result: SignupResult }) {
  const login = `${schoolUrl(result.school.code, '/login')}?email=${encodeURIComponent(result.admin_email)}`;

  return (
    <WebsiteShell>
      <Card>
        <CardBody className="space-y-5 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-8" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{result.school.name} is ready</h1>
            <p className="mt-2 text-sm text-slate-500">
              Your school has its own address. Bookmark it and share it with your staff.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800">
            <School className="size-4 text-slate-400" aria-hidden />
            {window.location.host}/{result.school.code}
          </div>
          {result.trial_ends_at && (
            <p className="text-sm text-slate-600">
              Your free trial runs until <strong>{formatDate(result.trial_ends_at)}</strong>.
            </p>
          )}
          <a
            href={login}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            Sign in to your school
            <ArrowRight className="size-4" aria-hidden />
          </a>
          <p className="text-xs text-slate-500">Sign in with {result.admin_email} and the password you just chose.</p>
        </CardBody>
      </Card>
    </WebsiteShell>
  );
}
