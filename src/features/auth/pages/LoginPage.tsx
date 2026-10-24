import { Sparkles } from 'lucide-react';
import { useLayoutEffect } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuthLayoutContext } from '@/components/layout/AuthLayout';

import { DemoAccounts } from '../components/DemoAccounts';
import { LoginForm } from '../components/LoginForm';
import { useDemoAccounts } from '../hooks/useDemoAccounts';

export default function LoginPage() {
  const { data: demoAccounts = [] } = useDemoAccounts();
  const { setWide } = useAuthLayoutContext();

  // Expand the AuthLayout container when demo accounts are available.
  useLayoutEffect(() => {
    setWide(demoAccounts.length > 0);
  }, [demoAccounts.length, setWide]);

  const signIn = (
    <Card>
      <CardBody className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your credentials to access your account.
          </p>
        </div>
        <LoginForm />
      </CardBody>
    </Card>
  );

  /** No demo accounts — plain sign-in only */
  if (demoAccounts.length === 0) return signIn;

  /**
   * Demo school layout — showcase card across the full width, then
   * info panel + regular sign-in form side by side below.
   */
  return (
    <div className="w-full space-y-5">
      {/* ── Demo showcase card ─────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-white to-brand-50 shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-100 px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="size-4 text-brand-500" aria-hidden />
              <h2 className="text-base font-semibold text-slate-900">Demo accounts</h2>
              <Badge tone="info">No password needed</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Click any role card to sign in instantly — explore every feature as that person.
            </p>
          </div>
          <p className="shrink-0 text-xs text-slate-400">
            Sign-in accounts, roles and outgoing mail are locked in demo mode.
          </p>
        </div>

        {/* Role cards grid */}
        <div className="p-5">
          <DemoAccounts accounts={demoAccounts} />
        </div>
      </div>

      {/* ── Sign in with credentials ───────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-[2fr_3fr]">
        {/* Info panel */}
        <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6">
          <h3 className="font-semibold text-slate-900">Have your own account?</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Staff members, teachers and parents with personal credentials can sign in using the
            form on the right. Demo accounts are shared and have no password.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-slate-500">
            {[
              'All modules are fully working',
              'Real data — students, fees, exams',
              'Each role sees its own dashboard',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Regular sign-in form */}
        {signIn}
      </div>
    </div>
  );
}
