import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { applyServerErrors } from '@/lib/formErrors';

import { useChangePassword } from '../hooks/usePasswordMutations';
import { changePasswordSchema, type ChangePasswordInput } from '../schemas';

import { PasswordRequirements } from './PasswordRequirements';

const FIELDS = ['current_password', 'password', 'password_confirmation'] as const;

const EMPTY: ChangePasswordInput = {
  current_password: '',
  password: '',
  password_confirmation: '',
};

/** Password change for the signed-in user, shown on the profile page. */
export function ChangePasswordForm() {
  const changePassword = useChangePassword();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY,
  });

  const passwordValue = form.watch('password');

  const onSubmit = (values: ChangePasswordInput) => {
    changePassword.mutate(values, {
      // Never leave passwords sitting in form state after a successful change.
      onSuccess: () => form.reset(EMPTY),
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not change your password.',
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader
        title="Change password"
        description="Your other devices will be signed out after a successful change."
      />
      <CardBody>
        <Form form={form} onSubmit={onSubmit} className="max-w-md space-y-5">
          <FormInput<ChangePasswordInput>
            name="current_password"
            type="password"
            label="Current password"
            autoComplete="current-password"
            required
          />

          <div className="space-y-2">
            <FormInput<ChangePasswordInput>
              name="password"
              type="password"
              label="New password"
              autoComplete="new-password"
              required
            />
            <PasswordRequirements value={passwordValue ?? ''} />
          </div>

          <FormInput<ChangePasswordInput>
            name="password_confirmation"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            required
          />

          <Button
            type="submit"
            isLoading={changePassword.isPending}
            leftIcon={<ShieldCheck className="size-4" />}
          >
            Update password
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
}
