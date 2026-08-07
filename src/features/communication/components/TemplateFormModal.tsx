import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { BodyEditor } from './BodyEditor';
import {
  APPROVAL_LABELS,
  CHANNEL_OPTIONS,
  SUBJECT_CHANNELS,
  TEMPLATE_CATEGORY_OPTIONS,
  TEMPLATE_ONLY_CHANNELS,
} from '../constants';
import { useCreateTemplate, useUpdateTemplate } from '../hooks/useCommunication';
import { templateSchema, type TemplateInput } from '../schemas';
import type { MessageTemplate } from '../types';

const FIELDS = ['name', 'code', 'channel', 'category', 'subject', 'body', 'is_active'] as const;

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  template?: MessageTemplate | null;
}

export function TemplateFormModal({ isOpen, onClose, template = null }: TemplateFormModalProps) {
  const isEdit = template !== null;

  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate(template?.id ?? 0);
  const mutation = isEdit ? updateTemplate : createTemplate;

  const form = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: template
      ? {
          name: template.name,
          code: template.code,
          channel: template.channel,
          category: template.category,
          subject: template.subject ?? '',
          body: template.body,
          is_active: template.is_active,
        }
      : {
          name: '',
          code: '',
          channel: 'sms',
          category: 'general',
          subject: '',
          body: '',
          is_active: true,
        },
  });

  const channel = form.watch('channel');
  const body = form.watch('body');

  const needsSubject = SUBJECT_CHANNELS.includes(channel);
  const needsApproval = TEMPLATE_ONLY_CHANNELS.includes(channel);

  // A subject on a channel that has nowhere to put one is a field that will
  // silently go nowhere.
  useEffect(() => {
    if (!needsSubject) form.setValue('subject', '');
  }, [needsSubject, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title={isEdit ? `Edit ${template.name}` : 'New template'}
      description="A message written once and reused, with placeholders filled in per recipient."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="template-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Save template'}
          </Button>
        </>
      }
    >
      <Form
        id="template-form"
        form={form}
        onSubmit={(values) =>
          mutation.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, FIELDS)) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        {isEdit && template.approval !== 'not_required' && (
          <Alert
            tone={template.approval === 'approved' ? 'success' : 'warning'}
            title={APPROVAL_LABELS[template.approval]}
          >
            {template.approval_note ??
              'WhatsApp templates are reviewed by Meta. Editing the body sends it back for approval.'}
          </Alert>
        )}

        <FormGrid cols={2}>
          <FormInput<TemplateInput>
            name="name"
            label="Name"
            placeholder="Absence notification"
            required
          />
          <FormInput<TemplateInput>
            name="code"
            label="Code"
            placeholder="ABSENT_DAILY"
            required
          />

          <FormSelect<TemplateInput>
            name="channel"
            label="Channel"
            options={CHANNEL_OPTIONS}
            disabled={isEdit}
            hint={isEdit ? 'A template belongs to one channel for life.' : undefined}
            required
          />
          <FormSelect<TemplateInput>
            name="category"
            label="Category"
            options={TEMPLATE_CATEGORY_OPTIONS}
            required
          />

          {needsSubject && (
            <FormFullRow>
              <FormInput<TemplateInput>
                name="subject"
                label="Subject"
                placeholder="{{student_name}} was absent today"
                required
              />
            </FormFullRow>
          )}
        </FormGrid>

        <BodyEditor
          value={body}
          onChange={(next) => form.setValue('body', next, { shouldValidate: true })}
          channels={[channel]}
          label="Template body"
          hasError={Boolean(form.formState.errors.body)}
          id="template-body"
        />
        {form.formState.errors.body && (
          <p role="alert" className="-mt-1 text-xs font-medium text-red-600">
            {form.formState.errors.body.message}
          </p>
        )}

        <FormCheckbox<TemplateInput>
          name="is_active"
          label="Available on the compose screen"
          description="Turn off to retire it without disturbing the messages already sent with it."
        />

        {needsApproval && !isEdit && (
          <Alert tone="warning" title="This will need approval">
            A new WhatsApp template goes to Meta for review and cannot be sent until they approve
            it. Everything else can be used straight away.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
