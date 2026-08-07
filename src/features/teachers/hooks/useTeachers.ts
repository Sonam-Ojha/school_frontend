import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import type { TeacherInput } from '../schemas';
import { teacherService } from '../services/teacherService';

export const teacherKeys = createResourceKeys('teachers');

/** Document list key, nested so deleting a teacher clears its documents too. */
export const teacherDocumentKeys = (id: number) =>
  [...teacherKeys.detail(id), 'documents'] as const;

export function useTeachers(params: ListQueryParams) {
  return useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: ({ signal }) => teacherService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useTeacher(id: number | string | undefined) {
  return useQuery({
    queryKey: teacherKeys.detail(id ?? ''),
    queryFn: ({ signal }) => teacherService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

function useInvalidateTeachers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
}

export function useCreateTeacher() {
  const invalidate = useInvalidateTeachers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TeacherInput) => teacherService.create(input),
    onSuccess: async (teacher) => {
      // Prime the detail cache so the profile it navigates to renders at once.
      queryClient.setQueryData(teacherKeys.detail(teacher.id), teacher);
      await invalidate();
      toast.success('Teacher added', `${teacher.full_name} — ${teacher.employee_id}`);
    },
  });
}

export function useUpdateTeacher(id: number) {
  const invalidate = useInvalidateTeachers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TeacherInput) => teacherService.update(id, input),
    onSuccess: async (teacher) => {
      queryClient.setQueryData(teacherKeys.detail(id), teacher);
      await invalidate();
      toast.success('Teacher updated', teacher.full_name);
    },
  });
}

export function useDeleteTeacher() {
  const invalidate = useInvalidateTeachers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teacherService.remove(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: teacherKeys.detail(id) });
      await invalidate();
      toast.success('Teacher record deleted');
    },
  });
}

/** Both outcomes are reported here, so the global error toast is suppressed. */
export function useExportTeachers() {
  return useMutation({
    mutationFn: ({ format, params }: { format: 'pdf' | 'excel'; params: ListQueryParams }) =>
      teacherService.export(format, params),
    onSuccess: (_result, { format }) =>
      toast.success(`${format === 'excel' ? 'Excel' : 'PDF'} export ready`, 'Check your downloads.'),
    onError: (error) => toast.error('Export failed', error.message),
    meta: { skipGlobalError: true },
  });
}
