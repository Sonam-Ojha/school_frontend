import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { applyServerErrors } from '@/lib/formErrors';
import { toast } from '@/store/toastStore';

import { useResetPassword } from '../hooks/usePasswordMutations';
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas';

import { PasswordRequirements } from './PasswordRequirements';

const FIELDS = ['token', 'email', 'password', 'password_confirmation'] as const;

interface ResetPasswordFormProps {
  /** From the emailed link. */
  token: string;
  /** Prefilled from the link; editable if it is missing. */
  email: string;
}

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, email, password: '', password_confirmation: '' },
  });

  const passwordValue = form.watch('password');

  const onSubmit = (values: ResetPasswordInput) => {
    resetPassword.mutate(values, {
      onSuccess: () => {
        toast.success('Password reset', 'You can now sign in with your new password.');
        navigate(PATHS.login, { replace: true });
      },
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not reset your password.',
        });
      },
    });
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      {!token && (
        <Alert tone="danger" title="Invalid link">
          This reset link is missing its token. Request a new link from the forgot-password page.
        </Alert>
      )}

      <FormInput<ResetPasswordInput>
        name="email"
        type="email"
        label="Email address"
        autoComplete="username"
        // Locked when the link supplied it — editing it would invalidate the token.
        readOnly={Boolean(email)}
        required
      />

      <div className="space-y-2">
        <FormInput<ResetPasswordInput>
          name="password"
          type="password"
          label="New password"
          autoComplete="new-password"
          autoFocus
          required
        />
        <PasswordRequirements value={passwordValue ?? ''} />
      </div>

      <FormInput<ResetPasswordInput>
        name="password_confirmation"
        type="password"
        label="Confirm new password"
        autoComplete="new-password"
        required
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={!token}
        isLoading={resetPassword.isPending}
        leftIcon={<KeyRound className="size-4" />}
      >
        Reset password
      </Button>
    </Form>
  );
}
