import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Card, CardBody } from '@/components/ui/Card';

import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Forgot your password?</h2>
            <p className="mt-1 text-sm text-slate-500">We will email you a link to reset it.</p>
          </div>

          <ForgotPasswordForm />
        </CardBody>
      </Card>

      <Link
        to={PATHS.login}
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to sign in
      </Link>
    </div>
  );
}
