import { Card, CardBody } from '@/components/ui/Card';

import { LoginForm } from '../components/LoginForm';

export default function LoginPage() {
  return (
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
}
