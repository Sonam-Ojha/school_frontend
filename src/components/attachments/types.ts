/**
 * A file attached to a record, as the API returns it.
 *
 * Distinct from `OwnedDocument`: a document is a filed record with a type and
 * a title ("Birth certificate"), while an attachment is whatever was uploaded
 * alongside a piece of work — it is previewed rather than catalogued, and
 * carries the metadata a preview needs (poster frame, duration).
 */
export type AttachmentKind = 'pdf' | 'image' | 'video' | 'other';

export interface FileAttachment {
  id: number;
  kind: AttachmentKind;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  /** Images and videos only — a poster frame for the latter. */
  thumbnail_url: string | null;
  /** Videos only. */
  duration_seconds: number | null;
  uploaded_at: string;
}
