import { CalendarRange, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { ACADEMIC_YEAR_PERMISSIONS } from '../constants';
import {
  useAcademicYears,
  useActivateAcademicYear,
  useDeleteAcademicYear,
} from '../hooks/useAcademicYears';
import type { AcademicYear } from '../types';

import { AcademicYearFormModal } from './AcademicYearFormModal';

/**
 * Academic sessions list with the current-session switch.
 *
 * The active session cannot be deleted — every admission, attendance record
 * and fee entry is scoped to one, so removing it would orphan live data.
 */
export function AcademicYearsCard() {
  const { data: years, isLoading, error } = useAcademicYears();
  const activate = useActivateAcademicYear();
  const deleteYear = useDeleteAcademicYear();

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(ACADEMIC_YEAR_PERMISSIONS.update);
  const canDelete = hasPermission(ACADEMIC_YEAR_PERMISSIONS.delete);

  const formModal = useDisclosure();
  const [editing, setEditing] = useState<AcademicYear | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AcademicYear | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const openCreate = () => {
    setEditing(null);
    formModal.open();
  };

  const openEdit = (year: AcademicYear) => {
    setEditing(year);
    formModal.open();
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Academic sessions"
          description="Admissions, attendance, exams and fees are all scoped to a session."
          actions={
            <Can permissions={[ACADEMIC_YEAR_PERMISSIONS.create]}>
              <Button size="sm" onClick={openCreate} leftIcon={<Plus className="size-4" />}>
                New session
              </Button>
            </Can>
          }
        />

        <CardBody className="p-0">
          {error ? (
            <div className="p-4 sm:p-6">
              <Alert tone="danger" title="Could not load sessions">
                {error.message}
              </Alert>
            </div>
          ) : isLoading ? (
            <ul className="divide-y divide-slate-100">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="space-y-2 px-4 py-4 sm:px-6">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-56" />
                </li>
              ))}
            </ul>
          ) : years && years.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {years.map((year) => (
                <li
                  key={year.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{year.name}</p>
                      {year.is_current && (
                        <Badge tone="success" withDot>
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDate(year.start_date)} — {formatDate(year.end_date)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!year.is_current && canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={activate.isPending && activatingId === year.id}
                        onClick={() => {
                          setActivatingId(year.id);
                          activate.mutate(year.id, { onSettled: () => setActivatingId(null) });
                        }}
                        leftIcon={<CheckCircle2 className="size-4" />}
                      >
                        Make current
                      </Button>
                    )}

                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Edit ${year.name}`}
                        onClick={() => openEdit(year)}
                        leftIcon={<Pencil className="size-4" />}
                      />
                    )}

                    {canDelete && !year.is_current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Delete ${year.name}`}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setPendingDelete(year)}
                        leftIcon={<Trash2 className="size-4" />}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<CalendarRange className="size-6" />}
              title="No academic sessions yet"
              description="Create the first session before admitting students."
              action={
                <Can permissions={[ACADEMIC_YEAR_PERMISSIONS.create]}>
                  <Button onClick={openCreate}>New session</Button>
                </Can>
              }
            />
          )}
        </CardBody>
      </Card>

      <AcademicYearFormModal
        // Remount per record so the form picks up the right defaults.
        key={editing?.id ?? 'create'}
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        academicYear={editing}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteYear.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteYear.isPending}
        isDestructive
        title="Delete this session?"
        confirmLabel="Delete session"
        message={
          pendingDelete ? (
            <>
              <strong>{pendingDelete.name}</strong> will be removed. Any records still scoped to it
              will be left without a session. This cannot be undone.
            </>
          ) : null
        }
      />
    </>
  );
}
