import { FileText, Film, ImageIcon, Paperclip } from 'lucide-react';
import type { ComponentType } from 'react';

import { cn } from '@/lib/cn';

import type { AttachmentKind, FileAttachment } from './types';
import { attachmentUrl } from './utils';

const ICONS: Record<AttachmentKind, ComponentType<{ className?: string }>> = {
  pdf: FileText,
  image: ImageIcon,
  video: Film,
  other: Paperclip,
};

const ICON_TONES: Record<AttachmentKind, string> = {
  pdf: 'text-red-600 bg-red-50',
  image: 'text-brand-600 bg-brand-50',
  video: 'text-purple-600 bg-purple-50',
  other: 'text-slate-500 bg-slate-100',
};

/**
 * Thumbnail for an attachment.
 *
 * Images and videos show their own frame; a PDF gets a typed icon rather than
 * a rendered first page, which would mean shipping a PDF renderer to preview
 * something the user is about to download anyway.
 */
export function AttachmentThumbnail({
  attachment,
  className,
}: {
  attachment: FileAttachment;
  className?: string;
}) {
  const Icon = ICONS[attachment.kind];

  if (attachment.kind === 'image' && attachment.thumbnail_url) {
    return (
      <img
        src={attachmentUrl(attachment.thumbnail_url)}
        alt={attachment.file_name}
        loading="lazy"
        className={cn('size-12 shrink-0 rounded-lg object-cover ring-1 ring-slate-200', className)}
      />
    );
  }

  if (attachment.kind === 'video' && attachment.thumbnail_url) {
    return (
      <span className={cn('relative size-12 shrink-0', className)}>
        <img
          src={attachmentUrl(attachment.thumbnail_url)}
          alt={attachment.file_name}
          loading="lazy"
          className="size-12 rounded-lg object-cover ring-1 ring-slate-200"
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-900/40">
          <Film className="size-4 text-white" aria-hidden />
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-lg',
        ICON_TONES[attachment.kind],
        className,
      )}
    >
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

/**
 * Full preview, shown when an attachment is opened.
 *
 * Video is `preload="metadata"` — a class of thirty opening a 200 MB clip
 * should not each pull the whole file before pressing play.
 */
export function AttachmentPreview({ attachment }: { attachment: FileAttachment }) {
  const source = attachmentUrl(attachment.url);

  if (attachment.kind === 'image') {
    return (
      <img
        src={source}
        alt={attachment.file_name}
        className="max-h-[70dvh] w-full rounded-lg object-contain"
      />
    );
  }

  if (attachment.kind === 'video') {
    return (
      <video
        src={source}
        controls
        preload="metadata"
        poster={attachment.thumbnail_url ? attachmentUrl(attachment.thumbnail_url) : undefined}
        className="max-h-[70dvh] w-full rounded-lg bg-slate-900"
      >
        Your browser cannot play this video. Download it instead.
      </video>
    );
  }

  if (attachment.kind === 'pdf') {
    return (
      <object
        data={source}
        type="application/pdf"
        className="h-[70dvh] w-full rounded-lg border border-slate-200"
      >
        {/* Mobile browsers routinely refuse to embed PDFs. */}
        <p className="p-6 text-center text-sm text-slate-500">
          This browser cannot display the PDF inline. Download it to read it.
        </p>
      </object>
    );
  }

  return (
    <p className="py-10 text-center text-sm text-slate-500">
      No preview available for this file type. Download it to open it.
    </p>
  );
}
