import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import type { ApplicationInput, CancelInput, LeaveTypeInput, ReviewInput } from '../schemas';
import {
  leaveService,
  type BalanceQuery,
  type ReportQuery,
} from '../services/leaveService';
import type { ApplicantType, LeaveApplication } from '../types';

export const leaveTypeKeys = createResourceKeys('leave-types');
export const applicationKeys = createResourceKeys('leave-applications');

export const leaveKeys = {
  all: ['leave'] as const,
  summary: () => ['leave', 'summary'] as const,
  balances: (query: BalanceQuery) => ['leave', 'balances', query] as const,
  balance: (type: ApplicantType, id: number) => ['leave', 'balance', type, id] as const,
  report: (query: ReportQuery) => ['leave', 'report', query] as const,
  away: (type: ApplicantType | null) => ['leave', 'away', type ?? 'all'] as const,
  preview: (from: string, to: string, type: ApplicantType, portion: string) =>
    ['leave', 'preview', from, to, type, portion] as const,
};

const LOOKUP_STALE_TIME = 10 * 60_000;

/**
 * Every write here moves a balance, a report and — because approved leave
 * locks an attendance row — what the attendance sheet will show tomorrow.
 * The attendance keys are invalidated too, for exactly that reason.
 */
function useInvalidateLeave() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    await queryClient.invalidateQueries({ queryKey: leaveTypeKeys.all });
    await queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    // Approved leave is what locks an attendance row — a stale sheet would
    // let somebody be marked absent on a day they were granted off.
    await queryClient.invalidateQueries({ queryKey: ['attendance'] });
  };
}

// --- leave types ------------------------------------------------------------

export function useLeaveTypes(params: ListQueryParams) {
  return useQuery({
    queryKey: leaveTypeKeys.list(params),
    queryFn: ({ signal }) => leaveService.listTypes(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useLeaveTypeCatalogue() {
  const query = useQuery({
    queryKey: leaveTypeKeys.options(),
    queryFn: ({ signal }) => leaveService.types(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const types = useMemo(() => query.data ?? [], [query.data]);

  /** Only what this kind of applicant may actually ask for. */
  const forApplicant = (applicantType: ApplicantType) =>
    types.filter((type) => type.is_active && type.applies_to.includes(applicantType));

  return { ...query, types, forApplicant };
}

export function useCreateLeaveType() {
  const invalidate = useInvalidateLeave();

  return useMutation({
    mutationFn: (input: LeaveTypeInput) => leaveService.createType(input),
    onSuccess: async (type) => {
      await invalidate();
      toast.success('Leave type added', `${type.name} can now be applied for.`);
    },
  });
}

export function useUpdateLeaveType(id: number) {
  const invalidate = useInvalidateLeave();

  return useMutation({
    mutationFn: (input: LeaveTypeInput) => leaveService.updateType(id, input),
    onSuccess: async () => {
      await invalidate();
      toast.success('Leave type updated');
    },
  });
}

export function useDeleteLeaveType() {
  const invalidate = useInvalidateLeave();

  return useMutation({
    mutationFn: (id: number) => leaveService.removeType(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Leave type removed');
    },
  });
}

// --- applications -----------------------------------------------------------

export function useApplications(params: ListQueryParams) {
  return useQuery({
    queryKey: applicationKeys.list(params),
    queryFn: ({ signal }) => leaveService.applications(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useApplication(id: number | string | undefined) {
  return useQuery({
    queryKey: applicationKeys.detail(id ?? ''),
    queryFn: ({ signal }) => leaveService.application(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

/**
 * What a request would actually cost, as the form is filled in.
 *
 * Only asked once both dates are set — a half-typed range would resolve to
 * something meaningless and flash a number nobody meant.
 */
export function useDaysPreview(
  fromDate: string,
  toDate: string,
  applicantType: ApplicantType,
  dayPortion: string,
) {
  return useQuery({
    queryKey: leaveKeys.preview(fromDate, toDate, applicantType, dayPortion),
    queryFn: ({ signal }) =>
      leaveService.previewDays(fromDate, toDate, applicantType, dayPortion, signal),
    enabled: fromDate !== '' && toDate !== '' && toDate >= fromDate,
  });
}

/** Application writes return the recomputed record, which is cached directly. */
function useApplicationMutation<TInput>(
  mutationFn: (input: TInput) => Promise<LeaveApplication>,
  message: (application: LeaveApplication) => [string, string?],
) {
  const invalidate = useInvalidateLeave();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (application) => {
      queryClient.setQueryData(applicationKeys.detail(application.id), application);
      await invalidate();
      const [title, description] = message(application);
      toast.success(title, description);
    },
  });
}

export function useApplyForLeave() {
  return useApplicationMutation<ApplicationInput>(
    (input) => leaveService.apply(input),
    (application) => [
      'Application filed',
      `${application.days} day${application.days === 1 ? '' : 's'} awaiting a decision.`,
    ],
  );
}

export function useReviewApplication() {
  return useApplicationMutation<ReviewInput>(
    (input) => leaveService.review(input),
    (application) => [
      application.status === 'approved' ? 'Leave approved' : 'Leave refused',
      application.status === 'approved'
        ? `${application.applicant_name} is away for ${application.days} day${application.days === 1 ? '' : 's'}.`
        : undefined,
    ],
  );
}

export function useWithdrawApplication() {
  return useApplicationMutation<number>(
    (id) => leaveService.withdraw(id),
    () => ['Application withdrawn'],
  );
}

export function useCancelApproval() {
  return useApplicationMutation<CancelInput>(
    (input) => leaveService.cancel(input),
    () => ['Approval undone', 'The days are back on the balance.'],
  );
}

export function useDeleteApplication() {
  const invalidate = useInvalidateLeave();

  return useMutation({
    mutationFn: (id: number) => leaveService.removeApplication(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Application deleted');
    },
  });
}

// --- balances ---------------------------------------------------------------

export function useBalances(query: BalanceQuery) {
  return useQuery({
    queryKey: leaveKeys.balances(query),
    queryFn: ({ signal }) => leaveService.balances(query, signal),
    placeholderData: (previous) => previous,
  });
}

export function useBalance(applicantType: ApplicantType | null, applicantId: number | null) {
  return useQuery({
    queryKey: leaveKeys.balance(applicantType ?? 'staff', applicantId ?? 0),
    queryFn: ({ signal }) => leaveService.balance(applicantType!, applicantId!, signal),
    enabled: Boolean(applicantType && applicantId),
  });
}

// --- reports ----------------------------------------------------------------

export function useLeaveReport(query: ReportQuery, enabled = true) {
  return useQuery({
    queryKey: leaveKeys.report(query),
    queryFn: ({ signal }) => leaveService.report(query, signal),
    enabled: enabled && query.from !== '' && query.to !== '',
    placeholderData: (previous) => previous,
  });
}

export function useAwayToday(applicantType: ApplicantType | null = null) {
  return useQuery({
    queryKey: leaveKeys.away(applicantType),
    queryFn: ({ signal }) => leaveService.awayToday(applicantType, signal),
    staleTime: 60_000,
  });
}

export function useLeaveSummary() {
  return useQuery({
    queryKey: leaveKeys.summary(),
    queryFn: ({ signal }) => leaveService.summary(signal),
    staleTime: 60_000,
  });
}

export function useExportApplications() {
  return useMutation({
    mutationFn: ({ params, format }: { params: ListQueryParams; format: 'pdf' | 'excel' }) =>
      leaveService.exportApplications(params, format),
    onError: (error: Error) => toast.error('Could not export the register', error.message),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ query, format }: { query: ReportQuery; format: 'pdf' | 'excel' }) =>
      leaveService.exportReport(query, format),
    onError: (error: Error) => toast.error('Could not export the report', error.message),
  });
}
