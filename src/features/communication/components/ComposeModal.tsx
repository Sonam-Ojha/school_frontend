import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import type { Option } from '@/types/common';

import { AudiencePicker } from './AudiencePicker';
import { BodyEditor } from './BodyEditor';
import {
  CHANNEL_LABELS,
  CHANNEL_STATUS_LABELS,
  LARGE_AUDIENCE,
  TEMPLATE_ONLY_CHANNELS,
} from '../constants';
import {
  useAudiencePreview,
  useChannels,
  useSendMessage,
  useTemplateCatalogue,
} from '../hooks/useCommunication';
import { messageSchema, type MessageInput } from '../schemas';
import type { Channel } from '../types';

const FIELDS = ['subject', 'body', 'channels', 'template_id', 'audience', 'scheduled_at'] as const;

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
  const sendMessage = useSendMessage();
  const { channels: health } = useChannels();
  const { usable, forChannel } = useTemplateCatalogue();
  const [confirming, setConfirming] = useState(false);

  const form = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      subject: '',
      body: '',
      channels: [],
      template_id: null,
      audience: { type: 'all_guardians', class_id: null, section_id: null, recipient_ids: [] },
      scheduled_at: '',
    },
  });

  const channels = form.watch('channels');
  const body = form.watch('body');
  const audience = form.watch('audience');
  const templateId = form.watch('template_id');

  const { data: preview } = useAudiencePreview(audience, isOpen);

  const needsTemplate = channels.some((channel) => TEMPLATE_ONLY_CHANNELS.includes(channel));

  /** Only templates usable on every chosen channel are worth offering. */
  const templateOptions = useMemo<Option<number>[]>(() => {
    const pool = needsTemplate
      ? forChannel(TEMPLATE_ONLY_CHANNELS.find((c) => channels.includes(c))!)
      : usable.filter((template) => channels.includes(template.channel));

    return pool.map((template) => ({
      label: `${template.name} (${template.code})`,
      value: template.id,
    }));
  }, [needsTemplate, channels, forChannel, usable]);

  // Applying a template replaces the body — the whole point of picking one.
  useEffect(() => {
    if (templateId === null) return;
    const template = usable.find((entry) => entry.id === templateId);
    if (!template) return;

    form.setValue('body', template.body);
    if (template.subject) form.setValue('subject', template.subject);
  }, [templateId, usable, form]);

  const toggleChannel = (channel: Channel) => {
    const current = form.getValues('channels');
    form.setValue(
      'channels',
      current.includes(channel)
        ? current.filter((entry) => entry !== channel)
        : [...current, channel],
      { shouldValidate: true },
    );
  };

  const handleClose = () => {
    form.reset();
    setConfirming(false);
    onClose();
  };

  const total = preview?.total ?? 0;
  const isLarge = total >= LARGE_AUDIENCE;

  const onSubmit = (values: MessageInput) => {
    // A send this size gets a second press, with the number said out loud.
    if (isLarge && !confirming) {
      setConfirming(true);
      return;
    }

    sendMessage.mutate(values, {
      onSuccess: handleClose,
      onError: (error) => {
        setConfirming(false);
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  const isScheduled = form.watch('scheduled_at') !== '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title="New message"
      description="Choose the channels, who it goes to, and what it says."
      closeOnOverlayClick={!sendMessage.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={sendMessage.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="compose-form"
            isLoading={sendMessage.isPending}
            variant={confirming ? 'danger' : 'primary'}
            leftIcon={<Send className="size-4" />}
          >
            {confirming
              ? `Yes — send to ${formatNumber(total)}`
              : isScheduled
                ? 'Schedule'
                : 'Send'}
          </Button>
        </>
      }
    >
      <Form id="compose-form" form={form} onSubmit={onSubmit}>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Channels</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {health.map((entry) => {
              const ready = entry.status === 'ready';

              return (
                <label
                  key={entry.channel}
                  className={cn(
                    'flex items-start gap-2 rounded-lg border p-2.5',
                    ready
                      ? 'border-slate-200 hover:border-brand-300'
                      : 'cursor-not-allowed border-dashed border-slate-200 opacity-60',
                  )}
                >
                  <Checkbox
                    checked={channels.includes(entry.channel)}
                    disabled={!ready}
                    onChange={() => toggleChannel(entry.channel)}
                    aria-label={CHANNEL_LABELS[entry.channel]}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">
                      {CHANNEL_LABELS[entry.channel]}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {ready
                        ? `${formatNumber(entry.sent_last_30_days)} sent this month`
                        : (entry.detail ?? CHANNEL_STATUS_LABELS[entry.status])}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {form.formState.errors.channels && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
              {form.formState.errors.channels.message}
            </p>
          )}
        </div>

        {needsTemplate && (
          <Alert tone="info" title="WhatsApp needs an approved template">
            Meta will not carry a freeform message to somebody who has not written to the school
            first. Only templates they have approved are listed.
          </Alert>
        )}

        <FormGrid cols={2}>
          <FormSelect<MessageInput>
            name="template_id"
            label="Template"
            options={templateOptions}
            placeholder={
              templateOptions.length === 0
                ? channels.length === 0
                  ? 'Choose a channel first'
                  : 'No template for these channels'
                : 'Write it myself'
            }
            disabled={templateOptions.length === 0}
            valueAsNumber
            required={needsTemplate}
          />
          <FormInput<MessageInput>
            name="scheduled_at"
            type="datetime-local"
            label="Send at"
            hint="Leave blank to send now."
          />

          <FormFullRow>
            <FormInput<MessageInput>
              name="subject"
              label="Subject"
              placeholder="Parent–teacher meeting on Saturday"
              hint={
                channels.includes('email')
                  ? 'Used as the email subject line.'
                  : 'For the log — not sent on these channels.'
              }
              required
            />
          </FormFullRow>
        </FormGrid>

        <BodyEditor
          value={body}
          onChange={(next) => form.setValue('body', next, { shouldValidate: true })}
          channels={channels}
          hasError={Boolean(form.formState.errors.body)}
        />
        {form.formState.errors.body && (
          <p role="alert" className="-mt-1 text-xs font-medium text-red-600">
            {form.formState.errors.body.message}
          </p>
        )}

        <div className="border-t border-slate-100 pt-4">
          <AudiencePicker
            value={audience}
            channels={channels}
            onChange={(next) => form.setValue('audience', next, { shouldValidate: true })}
          />
        </div>

        {confirming && (
          <Alert tone="warning" title={`This reaches ${formatNumber(total)} people`}>
            Press send again to confirm. A message this size cannot be recalled once it has
            gone.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
