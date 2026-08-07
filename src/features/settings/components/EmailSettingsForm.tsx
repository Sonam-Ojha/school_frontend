import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useDisclosure } from '@/hooks/useDisclosure';
import { applyServerErrors } from '@/lib/formErrors';

import { MAIL_ENCRYPTION_OPTIONS, SECRET_PLACEHOLDER } from '../constants';
import { useUpdateEmail } from '../hooks/useSettings';
import { emailSettingsSchema, type EmailSettingsInput } from '../schemas';
import type { EmailSettings } from '../types';

import { SettingsFormCard } from './SettingsFormCard';
import { TestDeliveryModal } from './TestDeliveryModal';

const FIELDS = [
  'enabled',
  'host',
  'port',
  'encryption',
  'username',
  'password',
  'from_address',
  'from_name',
] as const;

/** The stored password is never sent to the client; the field starts blank. */
const toFormValues = (email: EmailSettings): EmailSettingsInput => ({
  enabled: email.enabled,
  host: email.host,
  port: email.port,
  encryption: email.encryption,
  username: email.username,
  password: '',
  from_address: email.from_address,
  from_name: email.from_name,
});

export function EmailSettingsForm({ email }: { email: EmailSettings }) {
  const updateEmail = useUpdateEmail();
  const testModal = useDisclosure();

  const form = useForm<EmailSettingsInput>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: toFormValues(email),
  });

  const onSubmit = (values: EmailSettingsInput) => {
    updateEmail.mutate(values, {
      onSuccess: (settings) => form.reset(toFormValues(settings.email)),
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <>
      <SettingsFormCard
        title="Email (SMTP)"
        description="Used for password resets, receipts and notices."
        form={form}
        onSubmit={onSubmit}
        isPending={updateEmail.isPending}
        secondaryAction={
          <Button
            variant="outline"
            onClick={testModal.open}
            // Testing an unconfigured server would only ever fail.
            disabled={!email.host}
            leftIcon={<Send className="size-4" />}
          >
            Send test email
          </Button>
        }
      >
        <FormCheckbox<EmailSettingsInput>
          name="enabled"
          label="Send email from this school"
          description="Turn off to suppress all outgoing email, including password resets."
        />

        <FormGrid cols={2}>
          <FormInput<EmailSettingsInput>
            name="host"
            label="SMTP host"
            placeholder="smtp.mailgun.org"
            required
          />
          <FormInput<EmailSettingsInput>
            name="port"
            type="number"
            label="Port"
            placeholder="587"
            required
          />
          <FormSelect<EmailSettingsInput>
            name="encryption"
            label="Encryption"
            options={MAIL_ENCRYPTION_OPTIONS}
            required
          />
          <FormInput<EmailSettingsInput>
            name="username"
            label="Username"
            autoComplete="off"
            hint="Optional for servers that do not require authentication."
          />
          <FormInput<EmailSettingsInput>
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            placeholder={email.has_password ? SECRET_PLACEHOLDER : ''}
            hint={
              email.has_password
                ? 'A password is stored. Leave blank to keep it.'
                : 'No password stored yet.'
            }
          />
        </FormGrid>

        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold text-slate-900">Sender identity</h3>
          <FormGrid cols={2} className="mt-3">
            <FormInput<EmailSettingsInput>
              name="from_address"
              type="email"
              label="From address"
              placeholder="noreply@school.edu"
              required
            />
            <FormInput<EmailSettingsInput>
              name="from_name"
              label="From name"
              placeholder="Greenwood High"
              required
            />
          </FormGrid>
        </div>

        {!email.has_password && (
          <Alert tone="warning">
            No SMTP password is stored. Most providers reject unauthenticated mail.
          </Alert>
        )}
      </SettingsFormCard>

      <TestDeliveryModal
        channel="email"
        isOpen={testModal.isOpen}
        onClose={testModal.close}
        hasUnsavedChanges={form.formState.isDirty}
      />
    </>
  );
}
