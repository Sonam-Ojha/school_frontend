import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Form } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/apiError';
import { applyServerErrors } from '@/lib/formErrors';

import { useLogin } from '../hooks/useLogin';
import { loginSchema, type LoginInput } from '../schemas';

import { DevCredentialsHint } from './DevCredentialsHint';

const FIELDS = ['email', 'password', 'remember'] as const;

export function LoginForm() {
  const login = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = (values: LoginInput) => {
    login.mutate(values, {
      onError: (error) => {
        // 422 lands on the fields; a 401 is bad credentials, which Laravel
        // also reports as a validation error on `email` — anything else is a
        // form-level message.
        if (applyServerErrors(error, form.setError, FIELDS)) return;

        form.setError('root.serverError', {
          type: 'server',
          message:
            error instanceof ApiError && error.isUnauthorized
              ? 'These credentials do not match our records.'
              : error instanceof Error
                ? error.message
                : 'Unable to sign in. Please try again.',
        });
      },
    });
  };

  // Too many failed attempts — Laravel's throttle returns 429.
  const isThrottled = login.error instanceof ApiError && login.error.status === 429;

  return (
    <Form form={form} onSubmit={onSubmit}>
      {isThrottled && (
        <Alert tone="warning" title="Too many attempts">
          {login.error instanceof ApiError ? login.error.message : ''}
        </Alert>
      )}

      {/* Dropped from production builds along with the mock API. */}
      {import.meta.env.DEV && (
        <DevCredentialsHint
          onPick={(email, password) => {
            form.setValue('email', email, { shouldValidate: true });
            form.setValue('password', password, { shouldValidate: true });
          }}
        />
      )}

      <FormInput<LoginInput>
        name="email"
        type="email"
        label="Email address"
        placeholder="you@school.edu"
        autoComplete="username"
        autoFocus
        required
      />

      <FormInput<LoginInput>
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />

      <div className="flex items-center justify-between gap-3">
        <FormCheckbox<LoginInput>
          name="remember"
          label="Remember me"
          description="Stay signed in on this device"
        />

        <Link
          to={PATHS.forgotPassword}
          className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={login.isPending}
        leftIcon={<LogIn className="size-4" />}
      >
        Sign in
      </Button>
    </Form>
  );
}
