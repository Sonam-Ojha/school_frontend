import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BadgeCheck, CreditCard, Headset, LogIn, ShieldCheck, TrendingUp, type LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { env } from '@/config/env';
import { ApiError } from '@/lib/apiError';
import { applyServerErrors } from '@/lib/formErrors';
import { toast } from '@/store/toastStore';

import { platformApi, platformKeys } from '../api';
import { usePlatformAuth } from '../store';

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean(),
});

type LoginForm = z.infer<typeof schema>;

const ROLE_ICONS: Record<string, LucideIcon> = {
  owner: ShieldCheck,
  support: Headset,
  billing: CreditCard,
  sales: TrendingUp,
};

/**
 * `/superadmin/login`: for whoever runs the platform, never for a school's
 * staff. In a presentation (`PLATFORM_DEMO_LOGIN` on the server) the form
 * arrives filled in with the Super Admin's credentials, and each console role
 * can be entered with one click.
 */
export default function PlatformLoginPage() {
  // Filled in from the app's own settings for a presentation (VITE_DEMO_SUPERADMIN_*).
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: env.demoSuperAdmin.email, password: env.demoSuperAdmin.password, remember: true },
  });
  const prefilled = Boolean(env.demoSuperAdmin.email && env.demoSuperAdmin.password);

  const demo = useQuery({
    queryKey: [...platformKeys.all, 'demo'],
    queryFn: ({ signal }) => platformApi.demo(signal),
    staleTime: 5 * 60_000,
    retry: false,
    meta: { skipGlobalError: true },
  });
  const accounts = demo.data?.enabled ? demo.data.accounts : [];

  useEffect(() => {
    document.title = `Sign in · Super Admin · ${env.appName}`;
  }, []);

  // The Super Admin's credentials, filled in for a presentation.
  const owner = accounts.find((account) => account.role === 'owner');
  useEffect(() => {
    if (!owner) return;
    if (!form.getValues('email')) form.setValue('email', owner.email);
    if (!form.getValues('password') && owner.password) form.setValue('password', owner.password);
  }, [owner, form]);

  const welcome = (user: { name: string }, token: string, me: Parameters<ReturnType<typeof usePlatformAuth.getState>['setSession']>[0]) => {
    usePlatformAuth.getState().setSession(me, token);
    toast.success(`Welcome, ${user.name}.`);
  };

  const login = useMutation({
    mutationFn: platformApi.login,
    meta: { skipGlobalError: true },
    onSuccess: ({ user, token }) => welcome(user, token, user),
    onError: (error) => {
      if (applyServerErrors(error, form.setError, ['email', 'password'])) return;
      form.setError('root.serverError', {
        type: 'server',
        message: error instanceof ApiError ? error.message : 'Unable to sign in.',
      });
    },
  });

  const quick = useMutation({
    mutationFn: platformApi.demoLogin,
    meta: { skipGlobalError: true },
    onSuccess: ({ user, token }) => welcome(user, token, user),
    onError: (error) => toast.error('Could not sign in', error instanceof Error ? error.message : undefined),
  });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-900 px-4 py-10">
      <div className={accounts.length > 0 ? 'w-full max-w-3xl' : 'w-full max-w-sm'}>
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-500 text-white">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <h1 className="mt-3 text-lg font-semibold text-white">Super Admin</h1>
          <p className="text-sm text-slate-400">{env.appName} platform console</p>
        </div>

        <div className={accounts.length > 0 ? 'grid gap-6 md:grid-cols-2 md:items-start' : ''}>
          <Card>
            <CardBody className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {owner || prefilled ? 'The Super Admin’s details are filled in — just press Sign in.' : 'Manage schools, plans and billing.'}
                </p>
              </div>
              <Form form={form} onSubmit={(values) => login.mutate(values)}>
                <FormInput<LoginForm> name="email" type="email" label="Email" autoComplete="username" autoFocus={!owner && !prefilled} required />
                <FormInput<LoginForm> name="password" type="password" label="Password" autoComplete="current-password" required />
                <FormCheckbox<LoginForm> name="remember" label="Keep me signed in on this device" />
                <Button type="submit" fullWidth size="lg" isLoading={login.isPending} leftIcon={<LogIn className="size-4" />} autoFocus={Boolean(owner) || prefilled}>
                  Sign in
                </Button>
              </Form>
            </CardBody>
          </Card>

          {accounts.length > 0 && (
            <Card>
              <CardBody className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">One-click sign-in</h2>
                    <Badge tone="info">Demo</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Each platform role sees only its part of the console.</p>
                </div>
                <ul className="space-y-2">
                  {accounts.map((account) => {
                    const Icon = ROLE_ICONS[account.role] ?? BadgeCheck;
                    return (
                      <li key={account.email}>
                        <button
                          type="button"
                          onClick={() => quick.mutate(account.email)}
                          disabled={quick.isPending}
                          className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:opacity-60"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                            <Icon className="size-5" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-slate-900">{account.role_label}</span>
                            <span className="block truncate text-xs text-slate-500">
                              {account.name} · {account.email}
                            </span>
                          </span>
                          <LogIn className="size-4 text-slate-400" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Looking for your school?{' '}
          <a href="/login" className="font-medium text-slate-300 hover:text-white">
            Sign in with its code
          </a>
        </p>
      </div>
    </div>
  );
}
