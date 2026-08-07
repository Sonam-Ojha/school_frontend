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

import { SECRET_PLACEHOLDER, SMS_PROVIDER_OPTIONS } from '../constants';
import { useUpdateSms } from '../hooks/useSettings';
import { smsSettingsSchema, type SmsSettingsInput } from '../schemas';
import type { SmsSettings } from '../types';

import { SettingsFormCard } from './SettingsFormCard';
import { TestDeliveryModal } from './TestDeliveryModal';

const FIELDS = ['enabled', 'provider', 'sender_id', 'api_key', 'endpoint'] as const;

const toFormValues = (sms: SmsSettings): SmsSettingsInput => ({
  enabled: sms.enabled,
  provider: sms.provider,
  sender_id: sms.sender_id,
  api_key: '',
  endpoint: sms.endpoint ?? '',
});

export function SmsSettingsForm({ sms }: { sms: SmsSettings }) {
  const updateSms = useUpdateSms();
  const testModal = useDisclosure();

  const form = useForm<SmsSettingsInput>({
    resolver: zodResolver(smsSettingsSchema),
    defaultValues: toFormValues(sms),
  });

  // Only the custom provider needs a caller-supplied endpoint.
  const provider = form.watch('provider');

  const onSubmit = (values: SmsSettingsInput) => {
    updateSms.mutate(values, {
      onSuccess: (settings) => form.reset(toFormValues(settings.sms)),
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <>
      <SettingsFormCard
        title="SMS"
        description="Used for attendance alerts, fee reminders and emergency notices."
        form={form}
        onSubmit={onSubmit}
        isPending={updateSms.isPending}
        secondaryAction={
          <Button
            variant="outline"
            onClick={testModal.open}
            disabled={!sms.has_api_key}
            leftIcon={<Send className="size-4" />}
          >
            Send test SMS
          </Button>
        }
      >
        <FormCheckbox<SmsSettingsInput>
          name="enabled"
          label="Send SMS from this school"
          description="Turn off to suppress all outgoing text messages."
        />

        <FormGrid cols={2}>
          <FormSelect<SmsSettingsInput>
            name="provider"
            label="Provider"
            options={SMS_PROVIDER_OPTIONS}
            required
          />
          <FormInput<SmsSettingsInput>
            name="sender_id"
            label="Sender ID"
            placeholder="GRNWD"
            hint="Usually 6 characters, assigned by your provider."
            required
          />
          <FormInput<SmsSettingsInput>
            name="api_key"
            type="password"
            label="API key"
            autoComplete="off"
            placeholder={sms.has_api_key ? SECRET_PLACEHOLDER : ''}
            hint={
              sms.has_api_key
                ? 'A key is stored. Leave blank to keep it.'
                : 'No API key stored yet.'
            }
          />
          {provider === 'custom' && (
            <FormInput<SmsSettingsInput>
              name="endpoint"
              type="url"
              label="Endpoint URL"
              placeholder="https://sms.example.com/send"
              hint="Your gateway's HTTP endpoint."
              required
            />
          )}
        </FormGrid>

        {!sms.has_api_key && (
          <Alert tone="warning">
            No API key is stored, so SMS delivery will fail until one is added.
          </Alert>
        )}
      </SettingsFormCard>

      <TestDeliveryModal
        channel="sms"
        isOpen={testModal.isOpen}
        onClose={testModal.close}
        hasUnsavedChanges={form.formState.isDirty}
      />
    </>
  );
}
