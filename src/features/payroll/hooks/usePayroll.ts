import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import type {
  ApproveRunInput,
  ComponentInput,
  MarkPaidInput,
  RunInput,
  StructureInput,
} from '../schemas';
import { payrollService, type StructureQuery } from '../services/payrollService';
import type { PayrollRunDetail } from '../types';

export const componentKeys = createResourceKeys('payroll-components');
export const runKeys = createResourceKeys('payroll-runs');

export const payrollKeys = {
  all: ['payroll'] as const,
  summary: () => ['payroll', 'summary'] as const,
  structures: (query: StructureQuery) => ['payroll', 'structures', query] as const,
  structure: (type: string, id: number) => ['payroll', 'structure', type, id] as const,
  unassigned: () => ['payroll', 'structures', 'unassigned'] as const,
  payslip: (id: number | string) => ['payroll', 'payslip', id] as const,
  register: (month: string) => ['payroll', 'statutory', month] as const,
};

/** The component catalogue changes once a year; the runs do not. */
const LOOKUP_STALE_TIME = 10 * 60_000;

/**
 * Any write here moves a figure somewhere else: changing a component's rate
 * reprices every structure that uses it, and every unprocessed run costed
 * from them. Precision would buy nothing and lose a stale-total bug.
 */
function useInvalidatePayroll() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    await queryClient.invalidateQueries({ queryKey: componentKeys.all });
    await queryClient.invalidateQueries({ queryKey: runKeys.all });
  };
}

// --- components -------------------------------------------------------------

export function useComponents(params: ListQueryParams) {
  return useQuery({
    queryKey: componentKeys.list(params),
    queryFn: ({ signal }) => payrollService.listComponents(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useComponentCatalogue() {
  const query = useQuery({
    queryKey: componentKeys.options(),
    queryFn: ({ signal }) => payrollService.components(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const components = useMemo(() => query.data ?? [], [query.data]);

  const earnings = useMemo(
    () => components.filter((entry) => entry.type === 'earning' && entry.is_active),
    [components],
  );
  const deductions = useMemo(
    () => components.filter((entry) => entry.type === 'deduction' && entry.is_active),
    [components],
  );

  return { ...query, components, earnings, deductions };
}

export function useCreateComponent() {
  const invalidate = useInvalidatePayroll();

  return useMutation({
    mutationFn: (input: ComponentInput) => payrollService.createComponent(input),
    onSuccess: async (component) => {
      await invalidate();
      toast.success('Component added', `${component.name} can now be put on a salary.`);
    },
  });
}

export function useUpdateComponent(id: number) {
  const invalidate = useInvalidatePayroll();

  return useMutation({
    mutationFn: (input: ComponentInput) => payrollService.updateComponent(id, input),
    onSuccess: async () => {
      await invalidate();
      toast.success('Component updated', 'Every salary using it has been repriced.');
    },
  });
}

export function useDeleteComponent() {
  const invalidate = useInvalidatePayroll();

  return useMutation({
    mutationFn: (id: number) => payrollService.removeComponent(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Component removed');
    },
  });
}

// --- structures -------------------------------------------------------------

export function useStructures(query: StructureQuery) {
  return useQuery({
    queryKey: payrollKeys.structures(query),
    queryFn: ({ signal }) => payrollService.structures(query, signal),
    placeholderData: (previous) => previous,
  });
}

export function useStructure(employeeType: string | null, employeeId: number | null) {
  return useQuery({
    queryKey: payrollKeys.structure(employeeType ?? '', employeeId ?? 0),
    queryFn: ({ signal }) => payrollService.structure(employeeType!, employeeId!, signal),
    enabled: Boolean(employeeType && employeeId),
    retry: false,
    // Somebody with no structure yet is an answer, not an error worth a toast.
    meta: { skipGlobalError: true },
  });
}

export function useUnassignedEmployees() {
  return useQuery({
    queryKey: payrollKeys.unassigned(),
    queryFn: ({ signal }) => payrollService.unassigned(signal),
    staleTime: 60_000,
  });
}

export function useSaveStructure() {
  const invalidate = useInvalidatePayroll();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StructureInput) => payrollService.saveStructure(input),
    onSuccess: async (structure) => {
      queryClient.setQueryData(
        payrollKeys.structure(structure.employee_type, structure.employee_id),
        structure,
      );
      await invalidate();
      toast.success('Salary saved', `${structure.employee_name} is on the payroll.`);
    },
  });
}

// --- runs -------------------------------------------------------------------

export function useRuns(params: ListQueryParams) {
  return useQuery({
    queryKey: runKeys.list(params),
    queryFn: ({ signal }) => payrollService.runs(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useRun(id: number | string | undefined) {
  return useQuery({
    queryKey: runKeys.detail(id ?? ''),
    queryFn: ({ signal }) => payrollService.run(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

/**
 * Every run write returns the recomputed run, which is cached directly.
 *
 * The totals are sums over the payslips; a client patching a status and
 * leaving the money alone would show an approved run whose figures were the
 * draft's.
 */
function useRunMutation<TInput>(
  mutationFn: (input: TInput) => Promise<PayrollRunDetail>,
  message: (run: PayrollRunDetail) => [string, string?],
) {
  const invalidate = useInvalidatePayroll();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (run) => {
      queryClient.setQueryData(runKeys.detail(run.id), run);
      await invalidate();
      const [title, description] = message(run);
      toast.success(title, description);
    },
  });
}

export function useCreateRun() {
  return useRunMutation<RunInput>(
    (input) => payrollService.createRun(input),
    (run) => ['Payroll opened', `${run.month} is ready to process.`],
  );
}

export function useProcessRun() {
  return useRunMutation<number>(
    (id) => payrollService.processRun(id),
    (run) => [
      'Payroll processed',
      `${run.employees_count} payslips · net ₹${run.net_total.toLocaleString('en-IN')}.`,
    ],
  );
}

export function useApproveRun() {
  return useRunMutation<ApproveRunInput>(
    (input) => payrollService.approveRun(input),
    () => ['Payroll approved', 'It can now be marked paid.'],
  );
}

export function useMarkPaid() {
  return useRunMutation<MarkPaidInput>(
    (input) => payrollService.markPaid(input),
    (run) => ['Payroll paid', `${run.month} is closed.`],
  );
}

export function useDeleteRun() {
  const invalidate = useInvalidatePayroll();

  return useMutation({
    mutationFn: (id: number) => payrollService.removeRun(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Payroll deleted');
    },
  });
}

// --- payslips ---------------------------------------------------------------

export function usePayslip(id: number | string | undefined) {
  return useQuery({
    queryKey: payrollKeys.payslip(id ?? ''),
    queryFn: ({ signal }) => payrollService.payslip(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

export function useDownloadPayslips() {
  return useMutation({
    mutationFn: ({ runId, month }: { runId: number; month: string }) =>
      payrollService.downloadRunPayslips(runId, month),
    onError: (error: Error) => toast.error('Could not download the payslips', error.message),
  });
}

// --- statutory --------------------------------------------------------------

export function useStatutoryRegister(month: string) {
  return useQuery({
    queryKey: payrollKeys.register(month),
    queryFn: ({ signal }) => payrollService.register(month, signal),
    enabled: month !== '',
    placeholderData: (previous) => previous,
  });
}

export function useExportRegister() {
  return useMutation({
    mutationFn: ({ month, scheme }: { month: string; scheme: 'pf' | 'esi' }) =>
      payrollService.exportRegister(month, scheme),
    onError: (error: Error) => toast.error('Could not export the return', error.message),
  });
}

export function usePayrollSummary() {
  return useQuery({
    queryKey: payrollKeys.summary(),
    queryFn: ({ signal }) => payrollService.summary(signal),
    staleTime: 60_000,
  });
}

export function useExportRun() {
  return useMutation({
    mutationFn: ({
      runId,
      month,
      format,
    }: {
      runId: number;
      month: string;
      format: 'pdf' | 'excel';
    }) => payrollService.exportRun(runId, month, format),
    onError: (error: Error) => toast.error('Could not export the payroll', error.message),
  });
}
