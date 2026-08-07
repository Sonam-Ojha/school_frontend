/** A file attached to a record. Shared by students, teachers and staff. */
export interface OwnedDocument {
  id: number;
  /** Free-form on the wire; each module constrains it with its own union. */
  type: string;
  title: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  uploaded_at: string;
}

/** Upload limits. Keep in step with the backend validation rules. */
export const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;

export const DOCUMENT_ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];
