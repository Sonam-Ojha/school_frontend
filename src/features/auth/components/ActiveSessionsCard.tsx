import { LogOut, Monitor, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatDateTime } from '@/lib/format';

import { useAuthSessions, useRevokeSession } from '../hooks/useAuthSessions';
import { useLogout } from '../hooks/useLogout';

/**
 * Devices holding a live token for this account, with per-device revoke and a
 * global "sign out everywhere". This is the user-facing half of session
 * management — the rest (boot revalidation, 401 handling, cross-tab sync)
 * happens in `SessionProvider`.
 */
export function ActiveSessionsCard() {
  const { data: sessions, isLoading, error } = useAuthSessions();
  const revokeSession = useRevokeSession();
  const logoutAll = useLogout({ allDevices: true });

  const signOutAllDialog = useDisclosure();
  const [pendingRevokeId, setPendingRevokeId] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader
        title="Signed-in devices"
        description="Revoke access for any device you do not recognise."
        actions={
          sessions && sessions.length > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={signOutAllDialog.open}
              leftIcon={<LogOut className="size-4" />}
            >
              Sign out everywhere
            </Button>
          ) : null
        }
      />

      <CardBody className="p-0">
        {error ? (
          <div className="p-4 sm:p-6">
            <Alert tone="danger" title="Could not load your devices">
              {error.message}
            </Alert>
          </div>
        ) : isLoading ? (
          <ul className="divide-y divide-slate-100">
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-4 sm:px-6">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </li>
            ))}
          </ul>
        ) : sessions && sessions.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Monitor className="size-4" aria-hidden />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{session.name}</p>
                      {session.is_current && (
                        <Badge tone="success" withDot>
                          This device
                        </Badge>
                      )}
                    </div>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {session.ip_address ?? 'Unknown IP'} · Last active{' '}
                      {formatDateTime(session.last_used_at, 'never')}
                    </p>
                  </div>
                </div>

                {!session.is_current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-start text-red-600 hover:bg-red-50 hover:text-red-700 sm:self-auto"
                    isLoading={revokeSession.isPending && pendingRevokeId === session.id}
                    onClick={() => {
                      setPendingRevokeId(session.id);
                      revokeSession.mutate(session.id, {
                        onSettled: () => setPendingRevokeId(null),
                      });
                    }}
                    leftIcon={<Trash2 className="size-4" />}
                  >
                    Revoke
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No other devices"
            description="You are only signed in on this device."
            icon={<Monitor className="size-6" />}
          />
        )}
      </CardBody>

      <ConfirmDialog
        isOpen={signOutAllDialog.isOpen}
        onClose={signOutAllDialog.close}
        onConfirm={() => logoutAll.mutate()}
        isLoading={logoutAll.isPending}
        isDestructive
        title="Sign out everywhere?"
        message="Every device, including this one, will be signed out and you will need to sign in again."
        confirmLabel="Sign out everywhere"
      />
    </Card>
  );
}
