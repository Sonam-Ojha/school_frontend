import type { AttachmentKind } from './types';

/**
 * Accepted upload types, grouped by how they are previewed.
 *
 * Video is deliberately separate: it needs a far larger size budget than a
 * worksheet, and a poster frame rather than an inline thumbnail.
 */
export const ACCEPTED_MIME_TYPES: Record<Exclude<AttachmentKind, 'other'>, readonly string[]> = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
};

export const ALL_ACCEPTED_MIME_TYPES = [
  ...ACCEPTED_MIME_TYPES.pdf,
  ...ACCEPTED_MIME_TYPES.image,
  ...ACCEPTED_MIME_TYPES.video,
];

/** Per-kind size ceilings. Keep in step with the backend rules. */
export const MAX_BYTES: Record<AttachmentKind, number> = {
  pdf: 15 * 1024 * 1024,
  image: 10 * 1024 * 1024,
  video: 200 * 1024 * 1024,
  other: 10 * 1024 * 1024,
};

export const ATTACHMENT_KIND_LABELS: Record<AttachmentKind, string> = {
  pdf: 'PDF',
  image: 'Image',
  video: 'Video',
  other: 'File',
};

/** Classify an uploaded file by its MIME type. */
export function kindForMime(mimeType: string): AttachmentKind {
  if (ACCEPTED_MIME_TYPES.pdf.includes(mimeType)) return 'pdf';
  if (ACCEPTED_MIME_TYPES.image.includes(mimeType)) return 'image';
  if (ACCEPTED_MIME_TYPES.video.includes(mimeType)) return 'video';
  return 'other';
}
