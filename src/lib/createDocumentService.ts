import type { ApiResource, CollectionResponse } from '@/types/api';
import type { OwnedDocument } from '@/types/documents';

import { http } from './axios';
import { downloadFile } from './download';

export interface DocumentUploadMeta {
  type: string;
  title: string;
}

export interface DocumentService {
  list: (ownerId: number, signal?: AbortSignal) => Promise<OwnedDocument[]>;
  upload: (ownerId: number, file: File, meta: DocumentUploadMeta) => Promise<OwnedDocument>;
  remove: (ownerId: number, documentId: number) => Promise<void>;
  download: (ownerId: number, document: OwnedDocument) => Promise<void>;
}

/**
 * Document endpoints for a record type, e.g. `/students` or `/teachers`.
 *
 * The `{owner}/{id}/documents` shape is identical everywhere, so each module
 * composes this rather than repeating four axios calls.
 *
 * Files are streamed through the API rather than linked at storage directly,
 * so downloads stay authorised — these are not public files.
 */
export function createDocumentService(ownerPath: string): DocumentService {
  const base = `/${ownerPath.replace(/^\/+|\/+$/g, '')}`;

  return {
    async list(ownerId, signal) {
      const { data } = await http.get<CollectionResponse<OwnedDocument>>(
        `${base}/${ownerId}/documents`,
        { signal },
      );
      return data.data;
    },

    async upload(ownerId, file, meta) {
      const body = new FormData();
      body.append('file', file);
      body.append('type', meta.type);
      body.append('title', meta.title.trim());

      const { data } = await http.post<ApiResource<OwnedDocument>>(
        `${base}/${ownerId}/documents`,
        body,
      );
      return data.data;
    },

    async remove(ownerId, documentId) {
      await http.delete(`${base}/${ownerId}/documents/${documentId}`);
    },

    async download(ownerId, document) {
      await downloadFile(`${base}/${ownerId}/documents/${document.id}/download`, document.file_name);
    },
  };
}
