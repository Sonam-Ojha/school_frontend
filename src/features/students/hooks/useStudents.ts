import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import type { ListQueryParams } from '@/types/api';
import type { Option } from '@/types/common';

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

/**
 * Active students as select options, labelled so that two children with the
 * same name can be told apart. Reference data, so it is cached.
 */
export function useStudentOptions(enabled = true) {
  const query = useQuery({
    queryKey: studentKeys.options(),
    queryFn: ({ signal }) => studentService.options(signal),
    staleTime: 5 * 60_000,
    enabled,
  });

  const studentOptions = useMemo<Option<number>[]>(
    () =>
      (query.data ?? []).map((student) => ({
        label: `${student.full_name} — ${student.admission_no} · ${student.class_name}${student.section_name ? ` ${student.section_name}` : ''}`,
        value: student.id,
      })),
    [query.data],
  );

  return { ...query, studentOptions };
}

export function useStudent(id: number | string | undefined) {
  return useQuery({
    queryKey: studentKeys.detail(id ?? ''),
    queryFn: ({ signal }) => studentService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}
