import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { teacherKeys } from '@/features/teachers/hooks/useTeachers';
import { teacherService } from '@/features/teachers/services/teacherService';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';
import type { Option } from '@/types/common';

import { subjectKeys } from './useAcademics';
import type { SubjectInput } from '../schemas';
import { academicsService } from '../services/academicsService';

export function useSubjects(params: ListQueryParams) {
  return useQuery({
    queryKey: subjectKeys.list(params),
    queryFn: ({ signal }) => academicsService.listSubjects(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useSubject(id: number | string | undefined) {
  return useQuery({
    queryKey: subjectKeys.detail(id ?? ''),
    queryFn: ({ signal }) => academicsService.showSubject(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

/**
 * Active teachers, as options for the assignment picker.
 *
 * Reads the teachers module's own service rather than a second endpoint —
 * subject↔teacher is one relationship, written from either side.
 */
export function useTeacherOptions() {
  const query = useQuery({
    queryKey: teacherKeys.options(),
    queryFn: ({ signal }) => teacherService.options(signal),
    staleTime: 5 * 60_000,
  });

  const teachers = useMemo(() => query.data ?? [], [query.data]);

  const teacherOptions = useMemo<Option<number>[]>(
    () =>
      teachers.map((teacher) => ({
        label: `${teacher.full_name} — ${teacher.employee_id}`,
        value: teacher.id,
      })),
    [teachers],
  );

  return { ...query, teachers, teacherOptions };
}

/**
 * Invalidate everything a subject write can affect.
 *
 * `teacherKeys.all` is included because assigning a teacher here changes what
 * their own profile lists under Subjects — the same pivot, seen from the
 * other side.
 */
function useInvalidateSubjects() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: subjectKeys.all }),
      queryClient.invalidateQueries({ queryKey: teacherKeys.all }),
    ]);
  };
}

export function useCreateSubject() {
  const invalidate = useInvalidateSubjects();

  return useMutation({
    mutationFn: (input: SubjectInput) => academicsService.createSubject(input),
    onSuccess: async (subject) => {
      await invalidate();
      toast.success('Subject created', `${subject.name} (${subject.code})`);
    },
  });
}

export function useUpdateSubject(id: number) {
  const invalidate = useInvalidateSubjects();

  return useMutation({
    mutationFn: (input: SubjectInput) => academicsService.updateSubject(id, input),
    onSuccess: async (subject) => {
      await invalidate();
      toast.success('Subject updated', subject.name);
    },
  });
}

export function useDeleteSubject() {
  const invalidate = useInvalidateSubjects();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => academicsService.removeSubject(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: subjectKeys.detail(id) });
      await invalidate();
      toast.success('Subject deleted');
    },
  });
}

export function useAssignTeachers(id: number) {
  const invalidate = useInvalidateSubjects();

  return useMutation({
    mutationFn: (teacherIds: number[]) => academicsService.assignTeachers(id, teacherIds),
    onSuccess: async (subject) => {
      await invalidate();
      toast.success(
        'Teachers updated',
        subject.teachers_count === 0
          ? `No teachers are assigned to ${subject.name}.`
          : `${subject.teachers_count} assigned to ${subject.name}.`,
      );
    },
  });
}
