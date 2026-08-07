import { LayoutGrid, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';

import { CLASS_PERMISSIONS, SHIFT_LABELS, SHIFT_TONES } from '../constants';
import { useDeleteSection } from '../hooks/useClasses';
import type { SchoolClass, Section } from '../types';

import { CapacityBar } from './CapacityBar';
import { SectionFormModal } from './SectionFormModal';

/**
 * The sections belonging to a class, with their shift, room and occupancy.
 *
 * A section holding students cannot be deleted — the enrolments would be
 * orphaned. Deactivating it is offered instead, which keeps the records and
 * removes it from the pickers.
 */
export function SectionsCard({ schoolClass }: { schoolClass: SchoolClass }) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(CLASS_PERMISSIONS.update);
  const canDelete = hasPermission(CLASS_PERMISSIONS.delete);

  const formModal = useDisclosure();
  const [editing, setEditing] = useState<Section | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Section | null>(null);
  const deleteSection = useDeleteSection(schoolClass.id);

  const openCreate = () => {
    setEditing(null);
    formModal.open();
  };

  const openEdit = (section: Section) => {
    setEditing(section);
    formModal.open();
  };

  const sections = [...schoolClass.sections].sort((a, b) => a.name.localeCompare(b.name));
  // A new section usually matches the shift the class already runs.
  const defaultShift = sections[0]?.shift ?? 'morning';

  return (
    <>
      <Card>
        <CardHeader
          title="Sections"
          description="Each section has its own shift, room and seat count."
          actions={
            <Can permissions={[CLASS_PERMISSIONS.create]}>
              <Button size="sm" onClick={openCreate} leftIcon={<Plus className="size-4" />}>
                Add section
              </Button>
            </Can>
          }
        />

        <CardBody className="p-0">
          {sections.length === 0 ? (
            <EmptyState
              icon={<LayoutGrid className="size-6" />}
              title="No sections yet"
              description="Students cannot be admitted to this class until it has at least one section."
              action={
                <Can permissions={[CLASS_PERMISSIONS.create]}>
                  <Button onClick={openCreate}>Add the first section</Button>
                </Can>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {sections.map((section) => (
                <li
                  key={section.id}
                  className={cn(
                    'flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6',
                    !section.is_active && 'bg-slate-50/60',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        Section {section.name}
                      </p>
                      <Badge tone={SHIFT_TONES[section.shift]}>
                        {SHIFT_LABELS[section.shift]}
                      </Badge>
                      {!section.is_active && <Badge tone="neutral">Inactive</Badge>}
                    </div>

                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      {section.room ? (
                        <>
                          <MapPin className="size-3" aria-hidden />
                          {section.room}
                        </>
                      ) : (
                        <span className="text-slate-400">No room assigned</span>
                      )}
                    </p>
                  </div>

                  <div className="w-full shrink-0 sm:w-48">
                    <CapacityBar enrolled={section.students_count} capacity={section.capacity} />
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Edit section ${section.name}`}
                        onClick={() => openEdit(section)}
                        leftIcon={<Pencil className="size-4" />}
                      />
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Delete section ${section.name}`}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setPendingDelete(section)}
                        leftIcon={<Trash2 className="size-4" />}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <SectionFormModal
        // Remount per record so `defaultValues` are applied.
        key={editing?.id ?? 'create'}
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        classId={schoolClass.id}
        className={schoolClass.name}
        section={editing}
        defaultShift={defaultShift}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteSection.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteSection.isPending}
        isDestructive={pendingDelete?.students_count === 0}
        title={
          pendingDelete && pendingDelete.students_count > 0
            ? 'This section still has students'
            : 'Delete this section?'
        }
        confirmLabel={
          pendingDelete && pendingDelete.students_count > 0 ? 'Try anyway' : 'Delete section'
        }
        message={
          pendingDelete ? (
            pendingDelete.students_count > 0 ? (
              <>
                <strong>{pendingDelete.students_count}</strong> student
                {pendingDelete.students_count === 1 ? ' is' : 's are'} enrolled in section{' '}
                <strong>{pendingDelete.name}</strong>. Move them to another section first, or
                mark this one inactive to keep their records intact.
              </>
            ) : (
              <>
                Section <strong>{pendingDelete.name}</strong> will be removed. This cannot be
                undone.
              </>
            )
          ) : null
        }
      />

      {sections.some((section) => section.students_count > section.capacity) && (
        <Alert tone="warning" title="Over capacity" className="mt-4">
          One or more sections hold more students than they have seats. Raise the capacity or
          move students to another section.
        </Alert>
      )}
    </>
  );
}
