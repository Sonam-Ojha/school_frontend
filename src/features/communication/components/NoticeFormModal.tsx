import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { todayInputValue } from '@/lib/format';

import { AudiencePicker } from './AudiencePicker';
import { PRIORITY_OPTIONS, TEMPLATE_CATEGORY_OPTIONS } from '../constants';
import { useCreateNotice, useUpdateNotice } from '../hooks/useCommunication';
import { noticeSchema, type NoticeInput } from '../schemas';
import type { Notice } from '../types';

const FIELDS = [
  'title', 'body', 'category', 'priority', 'audience',
  'publish_at', 'expires_at', 'is_pinned',
] as const;

interface NoticeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  notice?: Notice | null;
  onCreated?: (notice: Notice) => void;
}

export function NoticeFormModal({
  isOpen,
  onClose,
  notice = null,
  onCreated,
}: NoticeFormModalProps) {
  const isEdit = notice !== null;

  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice(notice?.id ?? 0);
  const mutation = isEdit ? updateNotice : createNotice;

  const form = useForm<NoticeInput>({
    resolver: zodResolver(noticeSchema),
    defaultValues: notice
      ? {
          title: notice.title,
          body: notice.body,
          category: notice.category,
          priority: notice.priority,
          audience: {
            type: notice.audience.type,
            class_id: notice.audience.class_id,
            section_id: notice.audience.section_id,
            recipient_ids: notice.audience.recipients.map((entry) => entry.id),
          },
          publish_at: notice.publish_at,
          expires_at: notice.expires_at ?? '',
          is_pinned: notice.is_pinned,
        }
      : {
          title: '',
          body: '',
          category: 'general',
          priority: 'normal',
          audience: {
            type: 'all_guardians',
            class_id: null,
            section_id: null,
            recipient_ids: [],
          },
          publish_at: todayInputValue(),
          expires_at: '',
          is_pinned: false,
        },
  });

  const audience = form.watch('audience');
  const priority = form.watch('priority');

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title={isEdit ? 'Edit notice' : 'New notice'}
      description="It goes on the board once published. Announcing it is a separate step."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="notice-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Save notice'}
          </Button>
        </>
      }
    >
      <Form
        id="notice-form"
        form={form}
        onSubmit={(values) =>
          mutation.mutate(values, {
            onSuccess: (saved) => {
              if (!isEdit) onCreated?.(saved);
              handleClose();
            },
            onError: (error) => {
              if (applyServerErrors(error, form.setError, FIELDS)) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <FormGrid cols={2}>
          <FormFullRow>
            <FormInput<NoticeInput>
              name="title"
              label="Title"
              placeholder="Parent–teacher meeting on Saturday"
              required
            />
          </FormFullRow>

          <FormSelect<NoticeInput>
            name="category"
            label="Category"
            options={TEMPLATE_CATEGORY_OPTIONS}
            required
          />
          <FormSelect<NoticeInput>
            name="priority"
            label="Priority"
            options={PRIORITY_OPTIONS}
            required
          />

          <FormInput<NoticeInput>
            name="publish_at"
            type="date"
            label="Goes up on"
            required
          />
          <FormInput<NoticeInput>
            name="expires_at"
            type="date"
            label="Comes down on"
            hint="Leave blank to leave it up."
          />

          <FormFullRow>
            <FormTextarea<NoticeInput> name="body" label="Notice" rows={6} required />
          </FormFullRow>

          <FormCheckbox<NoticeInput>
            name="is_pinned"
            label="Pin to the top"
            description="Pinned notices sit above the rest whatever their date."
          />
        </FormGrid>

        <div className="border-t border-slate-100 pt-4">
          <AudiencePicker
            value={audience}
            channels={[]}
            onChange={(next) => form.setValue('audience', next, { shouldValidate: true })}
          />
        </div>

        {priority === 'urgent' && (
          <Alert tone="warning">
            An urgent notice is shown in red at the top of the board. Announcing it is still a
            separate step — publishing alone does not send anybody anything.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
