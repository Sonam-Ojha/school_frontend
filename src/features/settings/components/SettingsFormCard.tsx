import { Save } from 'lucide-react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import type { ReactNode } from 'react';

import { Form } from '@/components/form/Form';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';

import { SETTINGS_PERMISSIONS } from '../constants';

interface SettingsFormCardProps<TFieldValues extends FieldValues> {
  title: string;
  description?: string;
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void;
  isPending: boolean;
  children: ReactNode;
  /** Extra actions beside Save, e.g. "Send test email". */
  secondaryAction?: ReactNode;
}

/**
 * Card + form + save-button shell shared by every settings group, so the six
 * forms cannot drift in layout, disabled logic or permission handling.
 *
 * Save is disabled until something changes and hidden entirely from users
 * without `settings.update` — they still get a read-only view of the values.
 */
export function SettingsFormCard<TFieldValues extends FieldValues>({
  title,
  description,
  form,
  onSubmit,
  isPending,
  children,
  secondaryAction,
}: SettingsFormCardProps<TFieldValues>) {
  const canUpdate = useAuthStore((state) => state.hasPermission)(SETTINGS_PERMISSIONS.update);

  return (
    <Form form={form} onSubmit={onSubmit}>
      <Card>
        <CardHeader title={title} description={description} />
        <CardBody className="space-y-5">
          <fieldset disabled={!canUpdate || isPending} className="space-y-5">
            {children}
          </fieldset>
        </CardBody>

        {canUpdate && (
          <CardFooter>
            {secondaryAction}
            <Button
              type="submit"
              isLoading={isPending}
              disabled={!form.formState.isDirty}
              leftIcon={<Save className="size-4" />}
            >
              Save changes
            </Button>
          </CardFooter>
        )}
      </Card>
    </Form>
  );
}
