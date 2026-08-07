import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { applyServerErrors } from '@/lib/formErrors';
import { formatDate } from '@/lib/format';
import type { AuthUser } from '@/types/auth';

import { useUpdateProfile } from '../hooks/useProfile';
import { updateProfileSchema, type UpdateProfileInput } from '../schemas';

import { AvatarUploader } from './AvatarUploader';

const FIELDS = ['name', 'email', 'phone'] as const;

export function ProfileForm({ user }: { user: AuthUser }) {
  const updateProfile = useUpdateProfile();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
    },
  });

  const onSubmit = (values: UpdateProfileInput) => {
    updateProfile.mutate(values, {
      // Re-baseline the form so `isDirty` reflects the saved state.
      onSuccess: (updated) =>
        form.reset({ name: updated.name, email: updated.email, phone: updated.phone ?? '' }),
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not save your profile.',
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader title="Profile" description="Your personal details and how we reach you." />

      <CardBody className="space-y-6">
        <AvatarUploader user={user} />

        <Form form={form} onSubmit={onSubmit}>
          <FormGrid cols={2}>
            <FormInput<UpdateProfileInput>
              name="name"
              label="Full name"
              autoComplete="name"
              required
            />
            <FormInput<UpdateProfileInput>
              name="email"
              type="email"
              label="Email address"
              autoComplete="email"
              hint="Changing this changes the address you sign in with."
              required
            />
            <FormInput<UpdateProfileInput>
              name="phone"
              type="tel"
              label="Phone number"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              hint="Optional"
            />
          </FormGrid>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-200 pt-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Roles</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Badge key={role} tone="info" className="capitalize">
                      {role.replace(/-/g, ' ')}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">None assigned</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Member since</p>
              <p className="mt-1 text-sm text-slate-700">{formatDate(user.created_at)}</p>
            </div>
          </div>

          <Button
            type="submit"
            // Nothing changed means nothing to save.
            disabled={!form.formState.isDirty}
            isLoading={updateProfile.isPending}
            leftIcon={<Save className="size-4" />}
          >
            Save changes
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
}
