/**
 * Shared attachment building blocks.
 *
 * Extracted when the assignments module needed the same preview, thumbnail
 * and upload rules the homework module already had — the second user of a
 * thing is when it moves, rather than being copied.
 */

export { AttachmentPreview, AttachmentThumbnail } from './AttachmentPreview';

export {
  ACCEPTED_MIME_TYPES,
  ALL_ACCEPTED_MIME_TYPES,
  ATTACHMENT_KIND_LABELS,
  MAX_BYTES,
  kindForMime,
} from './constants';

export { attachmentUrl, formatDuration } from './utils';

export type { AttachmentKind, FileAttachment } from './types';
