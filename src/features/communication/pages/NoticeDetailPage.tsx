import { Archive, ArrowLeft, Download, Megaphone, Pencil, Printer, Send } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { toast } from '@/store/toastStore';

import { NoticeFormModal } from '../components/NoticeFormModal';
import {
  CHANNEL_LABELS,
  COMMUNICATION_PERMISSIONS,
  NOTICE_PERMISSIONS,
  NOTICE_STATUS_LABELS,
  NOTICE_STATUS_TONES,
  PRIORITY_LABELS,
  PRIORITY_TONES,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_ONLY_CHANNELS,
} from '../constants';
import {
  useAnnounceNotice,
  useArchiveNotice,
  useChannels,
  useNotice,
  usePublishNotice,
  useSubmitNotice,
  useTemplateCatalogue,
} from '../hooks/useCommunication';
import { communicationService } from '../services/communicationService';
import type { Channel } from '../types';

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: notice, isLoading, error } = useNotice(id);
  const { channels: health } = useChannels();
  const { usable } = useTemplateCatalogue();

  const submitNotice = useSubmitNotice();
  const publishNotice = usePublishNotice();
  const archiveNotice = useArchiveNotice();
  const announceNotice = useAnnounceNotice();

  const editForm = useDisclosure();
  const announceDialog = useDisclosure();
  const archiveDialog = useDisclosure();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async () => {
    if (!notice) return;
    setIsDownloading(true);
    try {
      await communicationService.downloadNotice(notice);
    } catch (downloadError) {
      toast.error(
        'Could not download the notice',
        downloadError instanceof Error ? downloadError.message : 'Please try again.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !notice) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load this notice">
            {error?.message ?? 'It no longer exists.'}
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(PATHS.communicationNotices)}
          >
            Back to the board
          </Button>
        </CardBody>
      </Card>
    );
  }

  const needsTemplate = channels.some((channel) => TEMPLATE_ONLY_CHANNELS.includes(channel));
  const canAnnounce = channels.length > 0 && (!needsTemplate || templateId !== null);

  return (
    <>
      <div className="print-hidden">
        <PageHeader
          title={notice.title}
          description={`${TEMPLATE_CATEGORY_LABELS[notice.category]} · ${notice.audience_label}`}
          breadcrumbs={[
            { label: 'Communication', to: PATHS.communicationMessages },
            { label: 'Notice board', to: PATHS.communicationNotices },
            { label: notice.title },
          ]}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => navigate(PATHS.communicationNotices)}
                leftIcon={<ArrowLeft className="size-4" />}
              >
                Back
              </Button>

              <Can permissions={[NOTICE_PERMISSIONS.print]}>
                <Button
                  variant="outline"
                  isLoading={isDownloading}
                  onClick={download}
                  leftIcon={<Download className="size-4" />}
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="size-4" />}
                >
                  Print
                </Button>
              </Can>

              {notice.status === 'draft' && (
                <>
                  <Can permissions={[NOTICE_PERMISSIONS.update]}>
                    <Button
                      variant="outline"
                      onClick={editForm.open}
                      leftIcon={<Pencil className="size-4" />}
                    >
                      Edit
                    </Button>
                  </Can>

                  <Can permissions={[NOTICE_PERMISSIONS.create]}>
                    <Button
                      isLoading={submitNotice.isPending}
                      onClick={() => submitNotice.mutate(notice.id)}
                      leftIcon={<Send className="size-4" />}
                    >
                      Send for approval
                    </Button>
                  </Can>
                </>
              )}

              {notice.status === 'pending_approval' && (
                <Can permissions={[NOTICE_PERMISSIONS.publish]}>
                  <Button
                    isLoading={publishNotice.isPending}
                    onClick={() => publishNotice.mutate(notice.id)}
                  >
                    Publish
                  </Button>
                </Can>
              )}

              {notice.status === 'published' && (
                <>
                  <Can permissions={[COMMUNICATION_PERMISSIONS.send]}>
                    <Button
                      onClick={announceDialog.open}
                      leftIcon={<Megaphone className="size-4" />}
                    >
                      Announce
                    </Button>
                  </Can>

                  <Can permissions={[NOTICE_PERMISSIONS.update]}>
                    <Button
                      variant="outline"
                      onClick={archiveDialog.open}
                      leftIcon={<Archive className="size-4" />}
                    >
                      Take down
                    </Button>
                  </Can>
                </>
              )}
            </>
          }
        />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge tone={NOTICE_STATUS_TONES[notice.status]} withDot>
            {NOTICE_STATUS_LABELS[notice.status]}
          </Badge>
          <Badge tone={PRIORITY_TONES[notice.priority]}>
            {PRIORITY_LABELS[notice.priority]}
          </Badge>
          {notice.is_pinned && <Badge tone="warning">Pinned</Badge>}
          {notice.is_live && <Badge tone="success">On the board now</Badge>}
          {notice.announcements_count > 0 && (
            <Badge tone="info">Announced {notice.announcements_count}×</Badge>
          )}
        </div>

        {notice.status === 'pending_approval' && (
          <Alert tone="warning" title="Waiting for approval" className="mb-4">
            It is not on the board until somebody with the right to publish puts it there.
          </Alert>
        )}

        {notice.status === 'published' && !notice.is_live && (
          <Alert tone="info" className="mb-4">
            Published, but dated {formatDate(notice.publish_at)} — it appears on the board then.
          </Alert>
        )}
      </div>

      <Card>
        <CardHeader
          title="Notice"
          description={
            notice.expires_at
              ? `${formatDate(notice.publish_at)} to ${formatDate(notice.expires_at)}`
              : `From ${formatDate(notice.publish_at)}`
          }
          className="print-hidden"
        />

        <CardBody>
          {/* The print rules isolate this subtree; everything else is hidden. */}
          <div className="print-target">
            <h1 className="hidden text-xl font-bold text-slate-900 print:block">
              {notice.title}
            </h1>
            <p
              className={cn(
                'text-sm whitespace-pre-wrap text-slate-800',
                notice.priority === 'urgent' && 'border-l-4 border-red-400 pl-3',
              )}
            >
              {notice.body}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-xs sm:grid-cols-4">
              {[
                ['Category', TEMPLATE_CATEGORY_LABELS[notice.category]],
                ['Audience', notice.audience_label],
                ['Posted by', notice.created_by ?? '—'],
                ['Approved by', notice.approved_by ?? 'Not yet'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="truncate font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </CardBody>
      </Card>

      {editForm.isOpen && (
        <NoticeFormModal isOpen={editForm.isOpen} onClose={editForm.close} notice={notice} />
      )}

      <ConfirmDialog
        isOpen={announceDialog.isOpen}
        onClose={announceDialog.close}
        onConfirm={() =>
          announceNotice.mutate(
            { notice_id: notice.id, channels, template_id: templateId },
            {
              onSuccess: () => {
                announceDialog.close();
                setChannels([]);
                setTemplateId(null);
              },
              onError: (announceError) =>
                toast.error('Could not announce this notice', announceError.message),
            },
          )
        }
        isLoading={announceNotice.isPending}
        title="Announce this notice?"
        confirmLabel={canAnnounce ? 'Announce' : 'Choose a channel'}
        message={
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              A message is raised from this notice and sent to {notice.audience_label}. The body
              comes from the notice, so the board and the broadcast cannot say different things.
            </p>

            <div className="space-y-1.5">
              {health.map((entry) => (
                <label
                  key={entry.channel}
                  className={cn(
                    'flex items-center gap-2 text-sm',
                    entry.status !== 'ready' && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <Checkbox
                    checked={channels.includes(entry.channel)}
                    disabled={entry.status !== 'ready'}
                    onChange={() =>
                      setChannels((current) =>
                        current.includes(entry.channel)
                          ? current.filter((c) => c !== entry.channel)
                          : [...current, entry.channel],
                      )
                    }
                    aria-label={CHANNEL_LABELS[entry.channel]}
                  />
                  <span>{CHANNEL_LABELS[entry.channel]}</span>
                  {entry.status !== 'ready' && (
                    <span className="text-xs text-slate-500">— {entry.detail}</span>
                  )}
                </label>
              ))}
            </div>

            {needsTemplate && (
              <div>
                <label
                  htmlFor="announce-template"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  WhatsApp template
                </label>
                <Select
                  id="announce-template"
                  value={templateId ?? ''}
                  options={usable
                    .filter((template) => template.channel === 'whatsapp')
                    .map((template) => ({ label: template.name, value: template.id }))}
                  placeholder="Choose an approved template"
                  onChange={(event) =>
                    setTemplateId(event.target.value ? Number(event.target.value) : null)
                  }
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  WhatsApp will not carry a freeform message to somebody who has not written
                  first.
                </p>
              </div>
            )}

            {notice.announcements_count > 0 && (
              <Alert tone="warning">
                This notice has already been announced {notice.announcements_count} time
                {notice.announcements_count === 1 ? '' : 's'}. Announcing again messages
                everybody a second time.
              </Alert>
            )}
          </div>
        }
      />

      <ConfirmDialog
        isOpen={archiveDialog.isOpen}
        onClose={archiveDialog.close}
        onConfirm={() =>
          archiveNotice.mutate(notice.id, { onSuccess: () => archiveDialog.close() })
        }
        isLoading={archiveNotice.isPending}
        title="Take this notice down?"
        confirmLabel="Take it down"
        message="It comes off the board immediately. Messages already announced from it are unaffected."
      />

    </>
  );
}
