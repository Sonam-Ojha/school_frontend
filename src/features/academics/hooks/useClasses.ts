import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import { classKeys } from './useAcademics';
import type { ClassInput, SectionInput } from '../schemas';
import { academicsService } from '../services/academicsService';

export function useClasses(params: ListQueryParams) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: ({ signal }) => academicsService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useSchoolClass(id: number | string | undefined) {
  return useQuery({
    queryKey: classKeys.detail(id ?? ''),
    queryFn: ({ signal }) => academicsService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

/**
 * Invalidate everything a class or section write can affect.
 *
 * `classKeys.all` covers the lists, the detail entries *and* the lookup
 * options — which matters because students and teachers pick classes and
 * sections from that same cached list. A new section must appear in their
 * dropdowns without a reload.
 */
function useInvalidateClasses() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: classKeys.all });
}

export function useCreateClass() {
  const invalidate = useInvalidateClasses();

  return useMutation({
    mutationFn: (input: ClassInput) => academicsService.createClass(input),
    onSuccess: async (schoolClass) => {
      await invalidate();
      toast.success('Class created', `${schoolClass.name} is ready for sections.`);
    },
  });
}

export function useUpdateClass(id: number) {
  const invalidate = useInvalidateClasses();

  return useMutation({
    mutationFn: (input: ClassInput) => academicsService.updateClass(id, input),
    onSuccess: async (schoolClass) => {
      await invalidate();
      toast.success('Class updated', schoolClass.name);
    },
  });
}

export function useDeleteClass() {
  const invalidate = useInvalidateClasses();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => academicsService.removeClass(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: classKeys.detail(id) });
      await invalidate();
      toast.success('Class deleted');
    },
  });
}

export function useCreateSection(classId: number) {
  const invalidate = useInvalidateClasses();

  return useMutation({
    mutationFn: (input: SectionInput) => academicsService.createSection(classId, input),
    onSuccess: async (section) => {
      await invalidate();
      toast.success('Section created', `Section ${section.name} added.`);
    },
  });
}

export function useUpdateSection(classId: number, sectionId: number) {
  const invalidate = useInvalidateClasses();

  return useMutation({
    mutationFn: (input: SectionInput) =>
      academicsService.updateSection(classId, sectionId, input),
    onSuccess: async (section) => {
      await invalidate();
      toast.success('Section updated', `Section ${section.name} saved.`);
    },
  });
}

export function useDeleteSection(classId: number) {
  const invalidate = useInvalidateClasses();

  return useMutation({
    mutationFn: (sectionId: number) => academicsService.removeSection(classId, sectionId),
    onSuccess: async () => {
      await invalidate();
      toast.success('Section deleted');
    },
  });
}
