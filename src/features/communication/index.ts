/** Public surface of the communication module. */

export { AudiencePicker } from './components/AudiencePicker';
export { BodyEditor } from './components/BodyEditor';
export { CommunicationStats } from './components/CommunicationStats';
export { ComposeModal } from './components/ComposeModal';
export { NoticeFormModal } from './components/NoticeFormModal';
export { TemplateFormModal } from './components/TemplateFormModal';

export {
  AVAILABLE_PLACEHOLDERS,
  GSM_CONCAT_LIMIT,
  GSM_SINGLE_LIMIT,
  UCS2_CONCAT_LIMIT,
  UCS2_SINGLE_LIMIT,
  extractPlaceholders,
  renderTemplate,
  smsCost,
  type RenderResult,
  type SmsCost,
  type SmsEncoding,
} from './composition';

export {
  APPROVAL_LABELS,
  APPROVAL_TONES,
  AUDIENCE_LABELS,
  AUDIENCE_OPTIONS,
  CHANNEL_LABELS,
  CHANNEL_OPTIONS,
  CHANNEL_STATUS_LABELS,
  CHANNEL_STATUS_TONES,
  COMMUNICATION_PERMISSIONS,
  EDITABLE_STATUSES,
  LARGE_AUDIENCE,
  MESSAGE_STATUS_LABELS,
  MESSAGE_STATUS_OPTIONS,
  MESSAGE_STATUS_TONES,
  NOTICE_PERMISSIONS,
  NOTICE_STATUS_LABELS,
  NOTICE_STATUS_OPTIONS,
  NOTICE_STATUS_TONES,
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  PRIORITY_TONES,
  SEGMENT_WARNING,
  STALE_DEVICE_DAYS,
  SUBJECT_CHANNELS,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_OPTIONS,
  TEMPLATE_ONLY_CHANNELS,
} from './constants';

export {
  communicationKeys,
  messageKeys,
  noticeKeys,
  templateKeys,
  useAnnounceNotice,
  useArchiveNotice,
  useAudiencePreview,
  useCancelMessage,
  useChannels,
  useCommunicationSummary,
  useCreateNotice,
  useCreateTemplate,
  useDeleteMessage,
  useDeleteNotice,
  useDeleteTemplate,
  useExportMessages,
  useMessage,
  useMessages,
  useNotice,
  useNotices,
  usePublishNotice,
  usePurgeStaleDevices,
  usePushDevices,
  useSendMessage,
  useSubmitNotice,
  useTemplateCatalogue,
  useTemplates,
  useUpdateNotice,
  useUpdateTemplate,
} from './hooks/useCommunication';

export { communicationService } from './services/communicationService';

export {
  announceSchema,
  messageSchema,
  noticeSchema,
  templateSchema,
  type AnnounceInput,
  type AudienceInput,
  type MessageInput,
  type NoticeInput,
  type TemplateInput,
} from './schemas';

export type {
  Audience,
  AudiencePreview,
  AudienceType,
  Channel,
  ChannelDelivery,
  ChannelHealth,
  ChannelStatus,
  CommunicationSummary,
  DevicePlatform,
  Message,
  MessageStatus,
  MessageTemplate,
  Notice,
  NoticePriority,
  NoticeStatus,
  PushDevice,
  TemplateApproval,
  TemplateCategory,
} from './types';
