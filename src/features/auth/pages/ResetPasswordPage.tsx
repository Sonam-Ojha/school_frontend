import { useParams, useSearchParams } from 'react-router-dom';

import { Card, CardBody } from '@/components/ui/Card';

import { ResetPasswordForm } from '../components/ResetPasswordForm';

/**
 * Target of the emailed reset link.
 *
 * Laravel's default notification builds `/reset-password/{token}?email=…`,
 * but the token is also accepted as a query parameter so a customised
 * notification URL does not break the screen.
 */
export default function ResetPasswordPage() {
  const { token: tokenParam } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();

  const token = tokenParam ?? searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  return (
    <Card>
      <CardBody className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Choose a new password</h2>
          <p className="mt-1 text-sm text-slate-500">
            Pick something you have not used on this account before.
          </p>
        </div>

        <ResetPasswordForm token={token} email={email} />
      </CardBody>
    </Card>
  );
}
