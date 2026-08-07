import { Download, Eye, Paperclip, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import {
  AttachmentPreview,
  AttachmentThumbnail,
  formatDuration,
} from '@/components/attachments';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatBytes, formatDateTime } from '@/lib/format';
import { toast } from '@/store/toastStore';

import {
  ALL_ACCEPTED_MIME_TYPES,
  ATTACHMENT_KIND_LABELS,
  MAX_ATTACHMENTS,
  MAX_BYTES,
  kindForMime,
} from '../constants';
import { useAddAttachment, useDownloadAttachment, useRemoveAttachment } from '../hooks/useHomework';
import type { HomeworkAttachment } from '../types';

interface AttachmentsCardProps {
  homeworkId: number;
  attachments: HomeworkAttachment[];
  canEdit: boolean;
}

/**
 * The files that go with a homework brief — worksheets, reference images,
 * recorded explanations.
 *
 * Uploads go one file at a time so a large video failing cannot take the
 * worksheets with it, and each kind carries its own size ceiling: a 200 MB
 * budget for video would be absurd for a PDF.
 */
export function AttachmentsCard({ homeworkId, attachments, canEdit }: AttachmentsCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addAttachment = useAddAttachment(homeworkId);
  const removeAttachment = useRemoveAttachment(homeworkId);
  const downloadAttachment = useDownloadAttachment(homeworkId);

  const previewModal = useDisclosure();
  const [previewing, setPreviewing] = useState<HomeworkAttachment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HomeworkAttachment | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const isFull = attachments.length >= MAX_ATTACHMENTS;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const room = MAX_ATTACHMENTS - attachments.length;
    const chosen = Array.from(files);

    if (chosen.length > room) {
      toast.error(
        'Too many files',
        `Only ${room} more attachment${room === 1 ? '' : 's'} can be added to this homework.`,
      );
      return;
    }

    for (const file of chosen) {
      if (!ALL_ACCEPTED_MIME_TYPES.includes(file.type)) {
        toast.error('Unsupported file', `${file.name} is not a PDF, image or video.`);
        continue;
      }

      const kind = kindForMime(file.type);
      if (file.size > MAX_BYTES[kind]) {
        toast.error(
          'File too large',
          `${file.name} exceeds the ${formatBytes(MAX_BYTES[kind])} limit for ${ATTACHMENT_KIND_LABELS[kind].toLowerCase()}s.`,
        );
        continue;
      }

      addAttachment.mutate(file);
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Attachments"
          description={`PDFs, images and videos. Up to ${MAX_ATTACHMENTS} files.`}
          actions={
            canEdit ? (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept={ALL_ACCEPTED_MIME_TYPES.join(',')}
                  className="sr-only"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                <Button
                  size="sm"
                  disabled={isFull}
                  isLoading={addAttachment.isPending}
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
          {attachments.length === 0 ? (
            <EmptyState
              icon={<Paperclip className="size-6" />}
              title="No attachments"
              description={
                canEdit
                  ? `Worksheets up to ${formatBytes(MAX_BYTES.pdf)}, images up to ${formatBytes(MAX_BYTES.image)}, videos up to ${formatBytes(MAX_BYTES.video)}.`
                  : 'This homework has no files attached.'
              }
              action={
                canEdit ? (
                  <Button onClick={() => inputRef.current?.click()}>Upload a file</Button>
                ) : null
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {attachments.map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewing(attachment);
                      previewModal.open();
                    }}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <AttachmentThumbnail attachment={attachment} />

                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-900">
                          {attachment.file_name}
                        </span>
                        <Badge tone="neutral">{ATTACHMENT_KIND_LABELS[attachment.kind]}</Badge>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {formatBytes(attachment.size_bytes)}
                        {attachment.duration_seconds !== null &&
                          ` · ${formatDuration(attachment.duration_seconds)}`}
                        {` · added ${formatDateTime(attachment.uploaded_at)}`}
                      </span>
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`Preview ${attachment.file_name}`}
                      onClick={() => {
                        setPreviewing(attachment);
                        previewModal.open();
                      }}
                      leftIcon={<Eye className="size-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`Download ${attachment.file_name}`}
                      isLoading={downloadAttachment.isPending && downloadingId === attachment.id}
                      onClick={() => {
                        setDownloadingId(attachment.id);
                        downloadAttachment.mutate(attachment, {
                          onSettled: () => setDownloadingId(null),
                        });
                      }}
                      leftIcon={<Download className="size-4" />}
                    />
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Remove ${attachment.file_name}`}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setPendingDelete(attachment)}
                        leftIcon={<Trash2 className="size-4" />}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>

        {isFull && canEdit && (
          <div className="border-t border-slate-200 px-4 py-3 sm:px-6">
            <Alert tone="info">
              This homework has the maximum {MAX_ATTACHMENTS} attachments. Remove one to add
              another.
            </Alert>
          </div>
        )}
      </Card>

      <Modal
        isOpen={previewModal.isOpen && previewing !== null}
        onClose={previewModal.close}
        size="xl"
        title={previewing?.file_name ?? 'Attachment'}
        description={
          previewing
            ? `${ATTACHMENT_KIND_LABELS[previewing.kind]} · ${formatBytes(previewing.size_bytes)}`
            : undefined
        }
      >
        {previewing && <AttachmentPreview attachment={previewing} />}
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          removeAttachment.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={removeAttachment.isPending}
        isDestructive
        title="Remove this attachment?"
        confirmLabel="Remove file"
        message={
          pendingDelete ? (
            <>
              <strong>{pendingDelete.file_name}</strong> will be deleted. Students who already
              downloaded it keep their copy, but it will no longer appear with the homework.
            </>
          ) : null
        }
      />
    </>
  );
}
