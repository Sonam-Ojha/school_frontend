import { zodResolver } from '@hookform/resolvers/zod';
import { UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/form/Form';
import { FormMultiSelect } from '@/components/form/FormMultiSelect';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { applyServerErrors } from '@/lib/formErrors';

import { useAssignTeachers, useSubject, useTeacherOptions } from '../hooks/useSubjects';
import { assignTeachersSchema, type AssignTeachersInput } from '../schemas';
import type { Subject } from '../types';

interface AssignTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
}

/**
 * Assign the teachers qualified to teach a subject.
 *
 * The same relationship the teacher form edits from the other side, so the
 * whole set is sent rather than deltas — and the teacher caches are
 * invalidated on success so their profiles agree immediately.
 */
export function AssignTeachersModal({ isOpen, onClose, subject }: AssignTeachersModalProps) {
  // The list row carries only a count, so the current set is fetched here.
  const { data: detail, isLoading } = useSubject(isOpen ? subject.id : undefined);
  const { teacherOptions, isLoading: teachersLoading } = useTeacherOptions();
  const assignTeachers = useAssignTeachers(subject.id);

  const form = useForm<AssignTeachersInput>({
    resolver: zodResolver(assignTeachersSchema),
    values: { teacher_ids: detail?.teachers.map((teacher) => teacher.id) ?? [] },
  });

  const selected = form.watch('teacher_ids');

  const onSubmit = (values: AssignTeachersInput) => {
    assignTeachers.mutate(values.teacher_ids, {
      onSuccess: onClose,
      onError: (error) => {
        if (applyServerErrors(error, form.setError, ['teacher_ids'])) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={`Teachers for ${subject.name}`}
      description="Only active teachers can be assigned."
      closeOnOverlayClick={!assignTeachers.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={assignTeachers.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="assign-teachers-form"
            isLoading={assignTeachers.isPending}
            disabled={isLoading}
          >
            Save assignment
          </Button>
        </>
      }
    >
      <Form id="assign-teachers-form" form={form} onSubmit={onSubmit}>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : (
          <>
            <FormMultiSelect<AssignTeachersInput>
              name="teacher_ids"
              label="Assigned teachers"
              options={teacherOptions}
              placeholder={teachersLoading ? 'Loading teachers…' : 'Select teachers'}
              emptyMessage="No active teachers have been added yet."
              hint="This also appears on each teacher's own profile."
            />

            {selected.length === 0 ? (
              <Alert tone="warning">
                No teachers are assigned. This subject will not appear on any teacher&apos;s
                profile, and cannot be timetabled.
              </Alert>
            ) : (
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <UserCheck className="size-3.5" aria-hidden />
                  {selected.length} selected
                </p>

                <ul className="space-y-1.5">
                  {(detail?.teachers ?? [])
                    .filter((teacher) => selected.includes(teacher.id))
                    .map((teacher) => (
                      <li key={teacher.id} className="flex items-center gap-2">
                        <Avatar name={teacher.full_name} src={teacher.photo_url} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm text-slate-800">{teacher.full_name}</p>
                          <p className="truncate text-xs text-slate-500">{teacher.designation}</p>
                        </div>
                      </li>
                    ))}

                  {/* Newly picked teachers are not in `detail` until saved. */}
                  {selected.some(
                    (id) => !(detail?.teachers ?? []).some((teacher) => teacher.id === id),
                  ) && (
                    <li className="text-xs text-slate-500">
                      …and newly selected teachers, shown once saved.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
}
