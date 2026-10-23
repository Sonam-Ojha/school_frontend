import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';

import { DemoAccounts } from '../components/DemoAccounts';
import { LoginForm } from '../components/LoginForm';
import { useDemoAccounts } from '../hooks/useDemoAccounts';

export default function LoginPage() {
  // Empty for a real school, where demo sign-in is switched off: the page is
  // then the sign-in form and nothing else.
  const { data: demoAccounts = [] } = useDemoAccounts();

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

  if (demoAccounts.length === 0) return signIn;

  return (
    // `data-wide` asks `AuthLayout` for the room to set the two cards side by
    // side. Below that width they stack in the usual narrow column, demo
    // accounts first: that is what a visitor to a demo installation came for.
    <div
      data-wide
      className="mx-auto grid max-w-sm gap-6 md:max-w-none md:grid-cols-[5fr_6fr] md:items-start"
    >
      <Card className="md:order-last">
        <CardBody className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Demo accounts</h2>
              <Badge tone="info">No password</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Pick a role and you are signed in straight away.
            </p>
          </div>

          <DemoAccounts accounts={demoAccounts} />

          <p className="text-xs text-slate-400">
            Every demo account works in the same sample school. Sign-in accounts, roles and
            outgoing mail are locked.
          </p>
        </CardBody>
      </Card>

      {signIn}
    </div>
  );
}
