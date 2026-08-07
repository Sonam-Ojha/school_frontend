import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import type { StudentInput } from '../schemas';
import { studentService } from '../services/studentService';
import type { ExportFormat, StudentDetail } from '../types';

import { studentKeys } from './useStudents';

/** Refresh every student list; detail entries are updated in place instead. */
function useInvalidateStudents() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
}

export function useCreateStudent() {
  const invalidate = useInvalidateStudents();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StudentInput) => studentService.create(input),
    onSuccess: async (student) => {
      // Prime the detail cache so the profile page it navigates to renders
      // immediately instead of showing a loader for a record we already have.
      queryClient.setQueryData(studentKeys.detail(student.id), student);
      await invalidate();
      toast.success('Student admitted', `${student.full_name} — ${student.admission_no}`);
    },
  });
}

export function useUpdateStudent(id: number) {
  const invalidate = useInvalidateStudents();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StudentInput) => studentService.update(id, input),
    onSuccess: async (student) => {
      queryClient.setQueryData(studentKeys.detail(id), student);
      await invalidate();
      toast.success('Student updated', student.full_name);
    },
  });
}

export function useDeleteStudent() {
  const invalidate = useInvalidateStudents();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentService.remove(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: studentKeys.detail(id) });
      await invalidate();
      toast.success('Student record deleted');
    },
  });
}

export function useUploadStudentPhoto(id: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateStudents();

  return useMutation({
    mutationFn: (file: File) => studentService.uploadPhoto(id, file),
    onSuccess: async (student: StudentDetail) => {
      queryClient.setQueryData(studentKeys.detail(id), student);
      await invalidate();
      toast.success('Photo updated');
    },
  });
}

/**
 * Export the current view to PDF or Excel.
 *
 * The download resolves before this settles, so `isPending` covers the whole
 * wait — these files are generated server-side and can take a few seconds.
 * Both outcomes are reported here, so the global error toast is suppressed.
 */
export function useExportStudents() {
  return useMutation({
    mutationFn: ({ format, params }: { format: ExportFormat; params: ListQueryParams }) =>
      studentService.export(format, params),
    onSuccess: (_result, { format }) =>
      toast.success(`${format === 'excel' ? 'Excel' : 'PDF'} export ready`, 'Check your downloads.'),
    onError: (error) => toast.error('Export failed', error.message),
    meta: { skipGlobalError: true },
  });
}
