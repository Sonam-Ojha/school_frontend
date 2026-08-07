import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, QrCode, Timer, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { useDisclosure } from '@/hooks/useDisclosure';
import { env } from '@/config/env';
import { applyServerErrors } from '@/lib/formErrors';
import { toast } from '@/store/toastStore';

import { ATTENDANCE_TYPE_LABELS } from '../constants';
import { useCreateQrSession, useQrSessions, useRevokeQrSession } from '../hooks/useDevices';
import { deviceService } from '../services/deviceService';
import { qrSessionSchema, type QrSessionInput } from '../schemas';
import type { QrSession } from '../types';

const TYPE_OPTIONS = (['student', 'teacher', 'staff'] as const).map((value) => ({
  label: ATTENDANCE_TYPE_LABELS[value],
  value,
}));

/** Whole minutes left, floored at zero. */
function minutesLeft(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60_000));
}

function SessionRow({ session, onRevoke }: { session: QrSession; onRevoke: () => void }) {
  // Recomputed on a timer so an expiring code visibly counts down.
  const [remaining, setRemaining] = useState(() => minutesLeft(session.expires_at));

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(minutesLeft(session.expires_at)), 30_000);
    return () => window.clearInterval(timer);
  }, [session.expires_at]);

  const isExpired = remaining === 0;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(session.check_in_url);
      toast.success('Check-in link copied');
    } catch {
      toast.error('Could not copy', 'Copy the link from the address shown instead.');
    }
  };

  return (
    <li className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
      {/* Rendered and signed by the backend — a client-generated code could be
          screenshotted and replayed, which the short expiry guards against. */}
      <img
        src={`${env.apiBaseUrl}${deviceService.qrImageUrl(session)}`}
        alt={`Check-in code for ${ATTENDANCE_TYPE_LABELS[session.type]}`}
        className="size-28 shrink-0 rounded-lg border border-slate-200 bg-white p-1"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">
          {ATTENDANCE_TYPE_LABELS[session.type]}
          {session.class_id ? ' — selected class' : ''}
        </p>

        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Timer className="size-3" aria-hidden />
            {isExpired ? 'Expired' : `${remaining} min left`}
          </span>
          <span>
            {session.checked_in_count} of {session.expected_count} checked in
          </span>
        </p>

        <code className="mt-1 block truncate text-xs text-slate-400">{session.check_in_url}</code>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyLink}
          leftIcon={<Copy className="size-4" />}
        >
          Copy link
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Revoke this code"
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onRevoke}
          leftIcon={<X className="size-4" />}
        />
      </div>
    </li>
  );
}

/**
 * QR check-in sessions.
 *
 * A displayed code students scan to mark themselves present. The code is
 * short-lived on purpose — the expiry is what stops a photographed code from
 * being reused later or off-site.
 */
export function QrSessionsCard() {
  const { data: sessions, isLoading, error } = useQrSessions();
  const createSession = useCreateQrSession();
  const revokeSession = useRevokeQrSession();
  const modal = useDisclosure();

  const form = useForm<QrSessionInput>({
    resolver: zodResolver(qrSessionSchema),
    defaultValues: { type: 'student', class_id: null, section_id: null, valid_for_minutes: 10 },
  });

  const selectedType = form.watch('type');
  const selectedClassId = form.watch('class_id');
  const { classOptions, sectionOptions } = useClassOptions(selectedClassId);

  const handleClose = () => {
    form.reset();
    modal.close();
  };

  const onSubmit = (values: QrSessionInput) => {
    createSession.mutate(values, {
      onSuccess: handleClose,
      onError: (submitError) => {
        if (applyServerErrors(submitError, form.setError)) return;
        form.setError('root.serverError', { type: 'server', message: submitError.message });
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader
          title="QR check-in"
          description="Display a short-lived code for people to scan themselves in."
          actions={
            <Button size="sm" onClick={modal.open} leftIcon={<QrCode className="size-4" />}>
              New code
            </Button>
          }
        />

        <CardBody className="p-0">
          {error ? (
            <div className="p-4 sm:p-6">
              <Alert tone="danger" title="Could not load check-in codes">
                {error.message}
              </Alert>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
              <Skeleton className="size-28 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          ) : sessions && sessions.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onRevoke={() => revokeSession.mutate(session.id)}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<QrCode className="size-6" />}
              title="No active check-in codes"
              description="Generate one at the start of a session; it expires on its own."
              action={<Button onClick={modal.open}>New code</Button>}
            />
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={modal.isOpen}
        onClose={handleClose}
        size="sm"
        title="New check-in code"
        description="Scanning marks the person present for today."
        closeOnOverlayClick={!createSession.isPending}
        footer={
          <>
            <Button variant="outline" onClick={handleClose} disabled={createSession.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="qr-session-form" isLoading={createSession.isPending}>
              Generate code
            </Button>
          </>
        }
      >
        <Form id="qr-session-form" form={form} onSubmit={onSubmit}>
          <FormSelect<QrSessionInput> name="type" label="For" options={TYPE_OPTIONS} required />

          {/* Employee codes are school-wide; only students are class-scoped. */}
          {selectedType === 'student' && (
            <FormGrid cols={2}>
              <FormSelect<QrSessionInput>
                name="class_id"
                label="Class"
                options={classOptions}
                placeholder="All classes"
                valueAsNumber
              />
              <FormSelect<QrSessionInput>
                name="section_id"
                label="Section"
                options={sectionOptions}
                placeholder={selectedClassId ? 'All sections' : 'Select a class first'}
                disabled={sectionOptions.length === 0}
                valueAsNumber
              />
            </FormGrid>
          )}

          <FormInput<QrSessionInput>
            name="valid_for_minutes"
            type="number"
            label="Valid for (minutes)"
            min={1}
            max={180}
            hint="Keep it short — a photographed code works until it expires."
            required
          />
        </Form>
      </Modal>
    </>
  );
}
