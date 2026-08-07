import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import type { Option } from '@/types/common';

import { academicsService } from '../services/academicsService';

export const classKeys = createResourceKeys('academics-classes');
export const subjectKeys = createResourceKeys('academics-subjects');

/** Reference data changes once a year — cache it hard. */
const LOOKUP_STALE_TIME = 15 * 60_000;

/**
 * Classes with their sections, plus ready-made select options.
 *
 * Pass a class id to get that class's sections; the section list collapses to
 * empty until one is chosen, which is what makes the dependent select work.
 */
export function useClassOptions(selectedClassId?: number | null) {
  const query = useQuery({
    queryKey: classKeys.options(),
    queryFn: ({ signal }) => academicsService.classes(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const classes = useMemo(() => query.data ?? [], [query.data]);

  const classOptions = useMemo<Option<number>[]>(
    () => classes.map((entry) => ({ label: entry.name, value: entry.id })),
    [classes],
  );

  const sectionOptions = useMemo<Option<number>[]>(() => {
    if (!selectedClassId) return [];
    const match = classes.find((entry) => entry.id === selectedClassId);
    return (match?.sections ?? []).map((section) => ({ label: section.name, value: section.id }));
  }, [classes, selectedClassId]);

  return { ...query, classes, classOptions, sectionOptions };
}

/** Every subject, plus options labelled `Name (CODE)`. */
export function useSubjectOptions() {
  const query = useQuery({
    queryKey: subjectKeys.options(),
    queryFn: ({ signal }) => academicsService.subjects(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const subjects = useMemo(() => query.data ?? [], [query.data]);

  const subjectOptions = useMemo<Option<number>[]>(
    () => subjects.map((subject) => ({ label: `${subject.name} (${subject.code})`, value: subject.id })),
    [subjects],
  );

  return { ...query, subjects, subjectOptions };
}
