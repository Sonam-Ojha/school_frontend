import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';

import type { DocumentService, DocumentUploadMeta } from '@/lib/createDocumentService';
import { toast } from '@/store/toastStore';
import type { OwnedDocument } from '@/types/documents';

export interface DocumentQueryConfig {
  service: DocumentService;
  ownerId: number;
  /** Key for the document list — nest it under the owner's detail key. */
  listKey: QueryKey;
  /** Owner detail key, invalidated so `documents_count` stays accurate. */
  ownerKey: QueryKey;
}

export function useDocumentList({ service, ownerId, listKey }: DocumentQueryConfig) {
  return useQuery({
    queryKey: listKey,
    queryFn: ({ signal }) => service.list(ownerId, signal),
  });
}

export function useUploadDocument({ service, ownerId, listKey, ownerKey }: DocumentQueryConfig) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, meta }: { file: File; meta: DocumentUploadMeta }) =>
      service.upload(ownerId, file, meta),
    onSuccess: async (document) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: listKey }),
        // `documents_count` lives on the owner record.
        queryClient.invalidateQueries({ queryKey: ownerKey }),
      ]);
      toast.success('Document uploaded', document.title);
    },
  });
}

export function useDeleteDocument({ service, ownerId, listKey, ownerKey }: DocumentQueryConfig) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: number) => service.remove(ownerId, documentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: listKey }),
        queryClient.invalidateQueries({ queryKey: ownerKey }),
      ]);
      toast.success('Document deleted');
    },
  });
}

/** Streams the file through the API so the download stays authorised. */
export function useDownloadDocument({ service, ownerId }: Pick<DocumentQueryConfig, 'service' | 'ownerId'>) {
  return useMutation({
    mutationFn: (document: OwnedDocument) => service.download(ownerId, document),
    onError: (error) => toast.error('Download failed', error.message),
    meta: { skipGlobalError: true },
  });
}
