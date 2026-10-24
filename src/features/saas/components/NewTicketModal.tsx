import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { useOpenTicket } from '../hooks/useSubscription';
import { TICKET_CATEGORY_LABELS, TICKET_PRIORITY_BADGES } from '../labels';
import type { SupportTicket, TicketCategory, TicketPriority } from '../types';

const ticketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, 'Give the ticket a subject of at least 5 characters.')
    .max(150, 'Keep the subject under 150 characters.'),
  category: z.enum(['technical', 'billing', 'account', 'feature', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  message: z
    .string()
    .trim()
    .min(10, 'Describe the problem in at least 10 characters, so the team can help.')
    .max(5000, 'Keep the message under 5,000 characters.'),
});

type TicketInput = z.infer<typeof ticketSchema>;

const FIELDS = ['subject', 'category', 'priority', 'message'] as const;
const FORM_ID = 'new-ticket-form';

const categoryOptions = (Object.keys(TICKET_CATEGORY_LABELS) as TicketCategory[]).map((value) => ({
  value,
  label: TICKET_CATEGORY_LABELS[value],
}));
const priorityOptions = (Object.keys(TICKET_PRIORITY_BADGES) as TicketPriority[]).map((value) => ({
  value,
  label: TICKET_PRIORITY_BADGES[value].label,
}));

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (ticket: SupportTicket) => void;
}

export function NewTicketModal({ isOpen, onClose, onCreated }: NewTicketModalProps) {
  const openTicket = useOpenTicket();
  const form = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: '', category: 'technical', priority: 'normal', message: '' },
  });

  const close = () => {
    form.reset();
    onClose();
  };

  const submit = (values: TicketInput) =>
    openTicket.mutate(values, {
      onSuccess: ({ ticket }) => {
        form.reset();
        onCreated?.(ticket);
        onClose();
      },
      onError: (error) => {
        if (!applyServerErrors(error, form.setError, FIELDS)) {
          form.setError('root.serverError', { type: 'server', message: error.message });
        }
      },
    });

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="lg"
      title="New support ticket"
      description="The platform team replies on the ticket, and you are emailed when they do."
      closeOnOverlayClick={!openTicket.isPending}
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={openTicket.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={openTicket.isPending}>
            Raise ticket
          </Button>
        </>
      }
    >
      <Form id={FORM_ID} form={form} onSubmit={submit}>
        <FormGrid cols={2}>
          <FormFullRow>
            <FormInput<TicketInput>
              name="subject"
              label="Subject"
              placeholder="e.g. Report cards show the wrong grade for Class 9"
              autoFocus
              required
            />
          </FormFullRow>
          <FormSelect<TicketInput> name="category" label="What is it about?" options={categoryOptions} required />
          <FormSelect<TicketInput>
            name="priority"
            label="How urgent is it?"
            options={priorityOptions}
            hint="Urgent: the school cannot work. High: a task is blocked."
            required
          />
          <FormFullRow>
            <FormTextarea<TicketInput>
              name="message"
              label="Describe the problem"
              rows={6}
              placeholder="What were you doing, what happened, and what did you expect? Mention the page and any record involved."
              required
            />
          </FormFullRow>
        </FormGrid>
      </Form>
    </Modal>
  );
}
