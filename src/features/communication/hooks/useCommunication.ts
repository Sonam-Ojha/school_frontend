import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import type { AnnounceInput, AudienceInput, MessageInput, NoticeInput, TemplateInput } from '../schemas';
import { communicationService } from '../services/communicationService';
import type { Channel, Notice } from '../types';

export const templateKeys = createResourceKeys('communication-templates');
export const noticeKeys = createResourceKeys('communication-notices');
export const messageKeys = createResourceKeys('communication-messages');

export const communicationKeys = {
  all: ['communication'] as const,
  summary: () => ['communication', 'summary'] as const,
  channels: () => ['communication', 'channels'] as const,
  devices: (params: ListQueryParams) => ['communication', 'push', 'devices', params] as const,
  audience: (audience: AudienceInput) => ['communication', 'audience', audience] as const,
};

/** The template catalogue changes rarely; the message log changes constantly. */
const LOOKUP_STALE_TIME = 5 * 60_000;

function useInvalidateCommunication() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: communicationKeys.all });
    await queryClient.invalidateQueries({ queryKey: templateKeys.all });
    await queryClient.invalidateQueries({ queryKey: noticeKeys.all });
    await queryClient.invalidateQueries({ queryKey: messageKeys.all });
  };
}

// --- channels ---------------------------------------------------------------

export function useChannels() {
  const query = useQuery({
    queryKey: communicationKeys.channels(),
    queryFn: ({ signal }) => communicationService.channels(signal),
    staleTime: 60_000,
  });

  const channels = useMemo(() => query.data ?? [], [query.data]);

  /** Channels that can actually send, for the compose screen's checkboxes. */
  const readyChannels = useMemo(
    () => channels.filter((entry) => entry.status === 'ready').map((entry) => entry.channel),
    [channels],
  );

  const isReady = (channel: Channel) => readyChannels.includes(channel);

  return { ...query, channels, readyChannels, isReady };
}

export function usePushDevices(params: ListQueryParams) {
  return useQuery({
    queryKey: communicationKeys.devices(params),
    queryFn: ({ signal }) => communicationService.pushDevices(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function usePurgeStaleDevices() {
  const invalidate = useInvalidateCommunication();

  return useMutation({
    mutationFn: () => communicationService.purgeStaleDevices(),
    onSuccess: async (result) => {
      await invalidate();
      toast.success(
        'Stale tokens cleared',
        `${result.removed} device${result.removed === 1 ? '' : 's'} removed.`,
      );
    },
  });
}

// --- templates --------------------------------------------------------------

export function useTemplates(params: ListQueryParams) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: ({ signal }) => communicationService.listTemplates(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useTemplateCatalogue() {
  const query = useQuery({
    queryKey: templateKeys.options(),
    queryFn: ({ signal }) => communicationService.templates(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const templates = useMemo(() => query.data ?? [], [query.data]);

  /** Only what can actually be sent — active, and approved where that matters. */
  const usable = useMemo(
    () =>
      templates.filter(
        (template) =>
          template.is_active &&
          (template.approval === 'not_required' || template.approval === 'approved'),
      ),
    [templates],
  );

  const forChannel = (channel: Channel) =>
    usable.filter((template) => template.channel === channel);

  return { ...query, templates, usable, forChannel };
}

export function useCreateTemplate() {
  const invalidate = useInvalidateCommunication();

  return useMutation({
    mutationFn: (input: TemplateInput) => communicationService.createTemplate(input),
    onSuccess: async (template) => {
      await invalidate();
      toast.success(
        'Template saved',
        template.approval === 'pending'
          ? 'WhatsApp templates cannot be used until they are approved.'
          : undefined,
      );
    },
  });
}

export function useUpdateTemplate(id: number) {
  const invalidate = useInvalidateCommunication();

  return useMutation({
    mutationFn: (input: TemplateInput) => communicationService.updateTemplate(id, input),
    onSuccess: async () => {
      await invalidate();
      toast.success('Template updated');
    },
  });
}

export function useDeleteTemplate() {
  const invalidate = useInvalidateCommunication();

  return useMutation({
    mutationFn: (id: number) => communicationService.removeTemplate(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Template removed');
    },
  });
}

// --- audiences --------------------------------------------------------------

/**
 * Resolve an audience as the compose screen is filled in.
 *
 * Only asked once the audience is complete enough to mean something — a
 * half-chosen class would otherwise resolve to the whole school for a moment.
 */
export function useAudiencePreview(audience: AudienceInput, enabled = true) {
  const isComplete =
    audience.type !== 'class'
      ? audience.type !== 'custom' || audience.recipient_ids.length > 0
      : audience.class_id !== null;

  return useQuery({
    queryKey: communicationKeys.audience(audience),
    queryFn: ({ signal }) => communicationService.previewAudience(audience, signal),
    enabled: enabled && isComplete,
    placeholderData: (previous) => previous,
  });
}

// --- messages ---------------------------------------------------------------

export function useMessages(params: ListQueryParams) {
  return useQuery({
    queryKey: messageKeys.list(params),
    queryFn: ({ signal }) => communicationService.messages(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useMessage(id: number | string | undefined) {
  return useQuery({
    queryKey: messageKeys.detail(id ?? ''),
    queryFn: ({ signal }) => communicationService.message(id!, signal),
    enabled: id !== undefined && id !== '',
    /**
     * A message in flight settles within seconds, so the detail screen watches
     * it rather than making somebody refresh — and stops once it has landed.
     */
    refetchInterval: (query) =>
      query.state.data?.status === 'sending' || query.state.data?.status === 'queued'
        ? 5_000
        : false,
  });
}

export function useSendMessage() {
  const invalidate = useInvalidateCommunication();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MessageInput) => communicationService.send(input),
    onSuccess: async (message) => {
      queryClient.setQueryData(messageKeys.detail(message.id), message);
      await invalidate();
      toast.success(
        message.status === 'queued' ? 'Message scheduled' : 'Message sent',
        `${message.recipients_count} recipient${message.recipients_count === 1 ? '' : 's'} on ${message.channels.length} channel${message.channels.length === 1 ? '' : 's'}.`,
      );
    },
  });
}

export function useCancelMessage() {
  const invalidate = useInvalidateCommunication();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => communicationService.cancel(id),
    onSuccess: async (message) => {
      queryClient.setQueryData(messageKeys.detail(message.id), message);
      await invalidate();
      toast.success('Message cancelled', 'It will not be sent.');
    },
  });
}

export function useDeleteMessage() {
  const invalidate = useInvalidateCommunication();

  return useMutation({
    mutationFn: (id: number) => communicationService.removeMessage(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Message removed from the log');
    },
  });
}

export function useExportMessages() {
  return useMutation({
    mutationFn: ({ params, format }: { params: ListQueryParams; format: 'pdf' | 'excel' }) =>
      communicationService.exportMessages(params, format),
    onError: (error: Error) => toast.error('Could not export the log', error.message),
  });
}

// --- notices ----------------------------------------------------------------

export function useNotices(params: ListQueryParams) {
  return useQuery({
    queryKey: noticeKeys.list(params),
    queryFn: ({ signal }) => communicationService.listNotices(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useNotice(id: number | string | undefined) {
  return useQuery({
    queryKey: noticeKeys.detail(id ?? ''),
    queryFn: ({ signal }) => communicationService.notice(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

/** Notice writes all return the recomputed notice, which is cached directly. */
function useNoticeMutation<TInput>(
  mutationFn: (input: TInput) => Promise<Notice>,
  message: (notice: Notice) => [string, string?],
) {
  const invalidate = useInvalidateCommunication();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (notice) => {
      queryClient.setQueryData(noticeKeys.detail(notice.id), notice);
      await invalidate();
      const [title, description] = message(notice);
      toast.success(title, description);
    },
  });
}

export function useCreateNotice() {
  return useNoticeMutation<NoticeInput>(
    (input) => communicationService.createNotice(input),
    () => ['Notice saved', 'Submit it when it is ready to go on the board.'],
  );
}

export function useUpdateNotice(id: number) {
  return useNoticeMutation<NoticeInput>(
    (input) => communicationService.updateNotice(id, input),
    () => ['Notice updated'],
  );
}

export function useSubmitNotice() {
  return useNoticeMutation<number>(
    (id) => communicationService.submitNotice(id),
    () => ['Sent for approval', 'It will go up once somebody publishes it.'],
  );
}

export function usePublishNotice() {
  return useNoticeMutation<number>(
    (id) => communicationService.publishNotice(id),
    (notice) => [
      'Notice published',
      notice.is_live ? 'It is on the board now.' : `It goes up on ${notice.publish_at}.`,
    ],
  );
}

export function useArchiveNotice() {
  return useNoticeMutation<number>(
    (id) => communicationService.archiveNotice(id),
    () => ['Notice archived', 'It has come off the board.'],
  );
}

export function useDeleteNotice() {
  const invalidate = useInvalidateCommunication();

  return useMutation({
    mutationFn: (id: number) => communicationService.removeNotice(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Notice deleted');
    },
  });
}

export function useAnnounceNotice() {
  const invalidate = useInvalidateCommunication();

  return useMutation({
    mutationFn: (input: AnnounceInput) => communicationService.announce(input),
    onSuccess: async (message) => {
      await invalidate();
      toast.success(
        'Notice announced',
        `${message.recipients_count} recipient${message.recipients_count === 1 ? '' : 's'} told.`,
      );
    },
  });
}

export function useCommunicationSummary() {
  return useQuery({
    queryKey: communicationKeys.summary(),
    queryFn: ({ signal }) => communicationService.summary(signal),
    staleTime: 60_000,
  });
}
