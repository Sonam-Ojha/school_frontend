import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

import { useSendTestEmail, useSendTestSms } from '../hooks/useSettings';
import {
  testEmailSchema,
  testSmsSchema,
  type TestEmailInput,
  type TestSmsInput,
} from '../schemas';

interface TestDeliveryModalProps {
  channel: 'email' | 'sms';
  isOpen: boolean;
  onClose: () => void;
  /** Warns that unsaved edits are not used — the test runs against saved config. */
  hasUnsavedChanges: boolean;
}

/**
 * Sends a real message through the *saved* configuration.
 *
 * That distinction matters: the test exercises what the server has stored, so
 * unsaved edits in the form behind it are not part of the test.
 */
export function TestDeliveryModal({
  channel,
  isOpen,
  onClose,
  hasUnsavedChanges,
}: TestDeliveryModalProps) {
  const isEmail = channel === 'email';

  const sendEmail = useSendTestEmail();
  const sendSms = useSendTestSms();
  const mutation = isEmail ? sendEmail : sendSms;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const form = useForm<any>({
    resolver: zodResolver(isEmail ? testEmailSchema : testSmsSchema),
    defaultValues: isEmail ? { email: '' } : { phone: '' },
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const handleClose = () => {
    form.reset();
    mutation.reset();
    onClose();
  };

  const onSubmit = (values: TestEmailInput | TestSmsInput) => {
    if (isEmail) sendEmail.mutate(values as TestEmailInput, { onSuccess: handleClose });
    else sendSms.mutate(values as TestSmsInput, { onSuccess: handleClose });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title={isEmail ? 'Send a test email' : 'Send a test SMS'}
      description={
        isEmail
          ? 'Delivers a short message using the saved SMTP settings.'
          : 'Delivers a short message using the saved SMS provider.'
      }
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="test-delivery-form"
            isLoading={mutation.isPending}
            leftIcon={<Send className="size-4" />}
          >
            Send test
          </Button>
        </>
      }
    >
      <Form id="test-delivery-form" form={form} onSubmit={onSubmit}>
        {hasUnsavedChanges && (
          <Alert tone="warning" title="Unsaved changes">
            This test uses the settings already saved on the server, not your unsaved edits. Save
            first to test the new values.
          </Alert>
        )}

        {isEmail ? (
          <FormInput
            name="email"
            type="email"
            label="Send to"
            placeholder="you@school.edu"
            autoFocus
            required
          />
        ) : (
          <FormInput
            name="phone"
            type="tel"
            label="Send to"
            placeholder="+91 98765 43210"
            autoFocus
            required
          />
        )}
      </Form>
    </Modal>
  );
}
