import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { applyServerErrors } from '@/lib/formErrors';

import { useForgotPassword } from '../hooks/usePasswordMutations';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas';

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: ForgotPasswordInput) => {
    forgotPassword.mutate(values, {
      onError: (error) => {
        if (applyServerErrors(error, form.setError, ['email'])) return;
        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not send the reset link.',
        });
      },
    });
  };

  // Confirmation is shown for any accepted request. It never reveals whether
  // the address is registered, so the screen cannot be used to enumerate users.
  if (forgotPassword.isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Check your inbox</h2>
          <p className="mt-1 text-sm text-slate-500">
            If an account exists for that address, we have sent a password reset link. The link
            expires in 60 minutes.
          </p>
        </div>
        <Button variant="outline" fullWidth onClick={() => forgotPassword.reset()}>
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <Alert tone="info">
        Enter the email address on your account and we will send you a link to choose a new
        password.
      </Alert>

      <FormInput<ForgotPasswordInput>
        name="email"
        type="email"
        label="Email address"
        placeholder="you@school.edu"
        autoComplete="username"
        autoFocus
        required
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={forgotPassword.isPending}
        leftIcon={<Send className="size-4" />}
      >
        Send reset link
      </Button>
    </Form>
  );
}
