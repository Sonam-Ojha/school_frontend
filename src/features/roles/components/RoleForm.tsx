import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useController, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Form } from '@/components/form/Form';
import { FormField } from '@/components/form/FormField';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { applyServerErrors } from '@/lib/formErrors';

import { usePermissions } from '../hooks/usePermissions';
import { roleSchema, type RoleInput } from '../schemas';

import { HiddenFieldsPicker } from './HiddenFieldsPicker';
import { PermissionMatrix } from './PermissionMatrix';

const FIELDS = ['name', 'permissions', 'hidden_fields'] as const;

interface RoleFormProps {
  defaultValues: RoleInput;
  onSubmit: (values: RoleInput, helpers: { onError: (error: unknown) => void }) => void;
  isPending: boolean;
  submitLabel: string;
  /** Seeded roles keep their name; only the permission set is editable. */
  isSystemRole?: boolean;
  onCancel: () => void;
}

/**
 * Shared by the create and edit screens — the two differ only in
 * `defaultValues` and which mutation they hand to `onSubmit`.
 */
export function RoleForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  isSystemRole = false,
  onCancel,
}: RoleFormProps) {
  const navigate = useNavigate();
  const { groups, actions, isLoading, error } = usePermissions();

  const form = useForm<RoleInput>({
    resolver: zodResolver(roleSchema),
    defaultValues,
  });

  // The matrix is not a native input, so it is driven through a controller
  // rather than `register`.
  const { field: permissionsField } = useController({
    name: 'permissions',
    control: form.control,
  });
  const { field: hiddenField } = useController({
    name: 'hidden_fields',
    control: form.control,
  });

  const handleSubmit = (values: RoleInput) => {
    onSubmit(values, {
      onError: (submitError) => {
        if (applyServerErrors(submitError, form.setError, FIELDS)) return;
        form.setError('root.serverError', {
          type: 'server',
          message: submitError instanceof Error ? submitError.message : 'Could not save the role.',
        });
      },
    });
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-6">
          <div className="max-w-md">
            <FormInput<RoleInput>
              name="name"
              label="Role name"
              placeholder="e.g. school-admin"
              hint="Lowercase, hyphen-separated. This is the slug used in policies."
              readOnly={isSystemRole}
              required
            />
            {isSystemRole && (
              <p className="mt-1.5 text-xs text-slate-500">
                System roles cannot be renamed. Their permissions are still editable.
              </p>
            )}
          </div>

          <FormField
            htmlFor="permissions"
            label="Permissions"
            error={form.formState.errors.permissions?.message}
          >
            {error ? (
              <Alert tone="danger" title="Could not load permissions">
                {error.message}
              </Alert>
            ) : isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-11 w-full" />
                ))}
              </div>
            ) : (
              <PermissionMatrix
                groups={groups}
                actions={actions}
                value={permissionsField.value}
                onChange={permissionsField.onChange}
                disabled={isPending}
              />
            )}
          </FormField>

          <FormField htmlFor="hidden_fields" label="Hide sensitive details from this role">
            <HiddenFieldsPicker value={hiddenField.value ?? []} onChange={hiddenField.onChange} disabled={isPending} />
          </FormField>
        </CardBody>

        <CardFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={isLoading}
            leftIcon={<Save className="size-4" />}
          >
            {submitLabel}
          </Button>
        </CardFooter>
      </Card>

      {/* Keeps the unsaved-changes guard honest without a router blocker. */}
      {form.formState.isDirty && !isPending && (
        <p className="text-xs text-slate-500">
          You have unsaved changes.{' '}
          <button
            type="button"
            className="font-medium text-brand-600 hover:underline"
            onClick={() => {
              form.reset(defaultValues);
              navigate('.', { replace: true });
            }}
          >
            Discard
          </button>
        </p>
      )}
    </Form>
  );
}
