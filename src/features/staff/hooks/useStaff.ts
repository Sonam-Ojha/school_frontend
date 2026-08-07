import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';
import type { Option } from '@/types/common';

import type { StaffInput } from '../schemas';
import { staffService } from '../services/staffService';

export const staffKeys = createResourceKeys('staff');

/** Document list key, nested so deleting a record clears its documents too. */
export const staffDocumentKeys = (id: number) => [...staffKeys.detail(id), 'documents'] as const;

export function useStaffList(params: ListQueryParams) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: ({ signal }) => staffService.list(params, signal),
    // Hold the previous page while the next loads, so paging does not flash
    // the whole table back to skeletons.
    placeholderData: (previous) => previous,
  });
}

/**
 * Active staff as select options — wardens, in-charges, anyone another module
 * needs to name. Reference data, so it is cached hard.
 */
export function useStaffOptions() {
  const query = useQuery({
    queryKey: staffKeys.options(),
    queryFn: ({ signal }) => staffService.options(signal),
    staleTime: 5 * 60_000,
  });

  const staff = useMemo(() => query.data ?? [], [query.data]);

  const staffOptions = useMemo<Option<number>[]>(
    () =>
      staff.map((member) => ({
        label: `${member.full_name} — ${member.designation}`,
        value: member.id,
      })),
    [staff],
  );

  return { ...query, staff, staffOptions };
}

export function useStaffMember(id: number | string | undefined) {
  return useQuery({
    queryKey: staffKeys.detail(id ?? ''),
    queryFn: ({ signal }) => staffService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

function useInvalidateStaff() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
}

export function useCreateStaff() {
  const invalidate = useInvalidateStaff();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StaffInput) => staffService.create(input),
    onSuccess: async (member) => {
      // Prime the detail cache so the profile it navigates to renders at once.
      queryClient.setQueryData(staffKeys.detail(member.id), member);
      await invalidate();
      toast.success('Staff member added', `${member.full_name} — ${member.employee_id}`);
    },
  });
}

export function useUpdateStaff(id: number) {
  const invalidate = useInvalidateStaff();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StaffInput) => staffService.update(id, input),
    onSuccess: async (member) => {
      queryClient.setQueryData(staffKeys.detail(id), member);
      await invalidate();
      toast.success('Staff member updated', member.full_name);
    },
  });
}

export function useDeleteStaff() {
  const invalidate = useInvalidateStaff();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => staffService.remove(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: staffKeys.detail(id) });
      await invalidate();
      toast.success('Staff record deleted');
    },
  });
}
