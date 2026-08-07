import { useQuery } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import type { ListQueryParams } from '@/types/api';

import { studentService } from '../services/studentService';

export const studentKeys = createResourceKeys('students');

/** Document list key, nested so deleting a student clears its documents too. */
export const studentDocumentKeys = (id: number) =>
  [...studentKeys.detail(id), 'documents'] as const;

export function useStudents(params: ListQueryParams) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: ({ signal }) => studentService.list(params, signal),
    // Hold the previous page while the next loads, so paging does not flash
    // the whole table back to skeletons.
    placeholderData: (previous) => previous,
  });
}

export function useStudent(id: number | string | undefined) {
  return useQuery({
    queryKey: studentKeys.detail(id ?? ''),
    queryFn: ({ signal }) => studentService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}
