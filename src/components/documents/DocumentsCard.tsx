import { zodResolver } from '@hookform/resolvers/zod';
import { Download, FileText, Paperclip, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatBytes, formatDateTime } from '@/lib/format';
import { toast } from '@/store/toastStore';
import type { Option } from '@/types/common';
import {
  DOCUMENT_ACCEPTED_TYPES,
  DOCUMENT_MAX_BYTES,
  type OwnedDocument,
} from '@/types/documents';

import {
  useDeleteDocument,
  useDocumentList,
  useDownloadDocument,
  useUploadDocument,
  type DocumentQueryConfig,
} from './useDocuments';

/** The type value comes from a fixed select, so presence is all that matters. */
const uploadSchema = z.object({
  type: z.string().min(1, 'Select a document type'),
  title: z.string().min(2, 'Title is required').max(100, 'Title is too long'),
});

type UploadInput = z.infer<typeof uploadSchema>;

interface DocumentsCardProps extends DocumentQueryConfig {
  /** Document types this owner accepts. */
  typeOptions: Option<string>[];
  typeLabels: Record<string, string>;
  canUpdate: boolean;
  canDelete: boolean;
  description?: string;
}

/**
 * Documents attached to a record — certificates, ID proofs, contracts.
 *
 * Owner-agnostic: students, teachers and staff all render this with their own
 * service and type list rather than each shipping a copy.
 *
 * There is no inline preview by design. Files stream through the API so the
 * download is authorised, which is exactly what a public preview URL would
 * undo.
 */
export function DocumentsCard({
  service,
  ownerId,
  listKey,
  ownerKey,
  typeOptions,
  typeLabels,
  canUpdate,
  canDelete,
  description = 'Certificates, ID proofs and other files held on record.',
}: DocumentsCardProps) {
  const config = { service, ownerId, listKey, ownerKey };

  const { data: documents, isLoading, error } = useDocumentList(config);
  const uploadDocument = useUploadDocument(config);
  const deleteDocument = useDeleteDocument(config);
  const downloadDocument = useDownloadDocument({ service, ownerId });

  const uploadModal = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OwnedDocument | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const defaultType = typeOptions.at(-1)?.value ?? '';

  const form = useForm<UploadInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { type: defaultType, title: '' },
  });

  const chooseFile = (chosen: File | undefined) => {
    if (!chosen) return;

    if (!DOCUMENT_ACCEPTED_TYPES.includes(chosen.type)) {
      toast.error('Unsupported file', 'Upload a PDF, JPG, PNG or WebP file.');
      return;
    }

    if (chosen.size > DOCUMENT_MAX_BYTES) {
      toast.error('File too large', `Maximum size is ${formatBytes(DOCUMENT_MAX_BYTES)}.`);
      return;
    }

    setFile(chosen);
    // Filename minus extension is nearly always the title staff would type.
    if (!form.getValues('title')) {
      form.setValue('title', chosen.name.replace(/\.[^.]+$/, ''), { shouldValidate: true });
    }
    uploadModal.open();
  };

  const closeUpload = () => {
    form.reset({ type: defaultType, title: '' });
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
    uploadModal.close();
  };

  const onSubmit = (meta: UploadInput) => {
    if (!file) return;
    uploadDocument.mutate({ file, meta }, { onSuccess: closeUpload });
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Documents"
          description={description}
          actions={
            canUpdate ? (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept={DOCUMENT_ACCEPTED_TYPES.join(',')}
                  className="sr-only"
                  onChange={(event) => chooseFile(event.target.files?.[0])}
                />
                <Button
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  leftIcon={<Upload className="size-4" />}
                >
                  Upload
                </Button>
              </>
            ) : null
          }
        />

        <CardBody className="p-0">
          {error ? (
            <div className="p-4 sm:p-6">
              <Alert tone="danger" title="Could not load documents">
                {error.message}
              </Alert>
            </div>
          ) : isLoading ? (
            <ul className="divide-y divide-slate-100">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-4 sm:px-6">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </li>
              ))}
            </ul>
          ) : documents && documents.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {documents.map((document) => (
                <li
                  key={document.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <FileText className="size-4" aria-hidden />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {document.title}
                        </p>
                        <Badge tone="neutral">{typeLabels[document.type] ?? document.type}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {document.file_name} · {formatBytes(document.size_bytes)} · uploaded{' '}
                        {formatDateTime(document.uploaded_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      isLoading={downloadDocument.isPending && downloadingId === document.id}
                      onClick={() => {
                        setDownloadingId(document.id);
                        downloadDocument.mutate(document, {
                          onSettled: () => setDownloadingId(null),
                        });
                      }}
                      leftIcon={<Download className="size-4" />}
                    >
                      Download
                    </Button>

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Delete ${document.title}`}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setPendingDelete(document)}
                        leftIcon={<Trash2 className="size-4" />}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Paperclip className="size-6" />}
              title="No documents uploaded"
              description={`PDF, JPG, PNG or WebP, up to ${formatBytes(DOCUMENT_MAX_BYTES)} each.`}
              action={
                canUpdate ? (
                  <Button onClick={() => inputRef.current?.click()}>Upload a document</Button>
                ) : null
              }
            />
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={uploadModal.isOpen}
        onClose={closeUpload}
        size="sm"
        title="Upload document"
        description={file ? `${file.name} · ${formatBytes(file.size)}` : undefined}
        closeOnOverlayClick={!uploadDocument.isPending}
        footer={
          <>
            <Button variant="outline" onClick={closeUpload} disabled={uploadDocument.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="document-upload-form" isLoading={uploadDocument.isPending}>
              Upload
            </Button>
          </>
        }
      >
        <Form id="document-upload-form" form={form} onSubmit={onSubmit}>
          <FormSelect<UploadInput>
            name="type"
            label="Document type"
            options={typeOptions}
            required
          />
          <FormInput<UploadInput>
            name="title"
            label="Title"
            hint="How this document appears in the list."
            required
          />
        </Form>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteDocument.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteDocument.isPending}
        isDestructive
        title="Delete this document?"
        confirmLabel="Delete document"
        message={
          pendingDelete ? (
            <>
              <strong>{pendingDelete.title}</strong> will be permanently removed from this record.
              This cannot be undone.
            </>
          ) : null
        }
      />
    </>
  );
}
