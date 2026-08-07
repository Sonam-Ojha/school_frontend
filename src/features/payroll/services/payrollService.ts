import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type {
  ApiResource,
  CollectionResponse,
  ListQueryParams,
  PaginatedResponse,
} from '@/types/api';

import type {
  ApproveRunInput,
  ComponentInput,
  MarkPaidInput,
  RunInput,
  StructureInput,
} from '../schemas';
import type {
  PayrollRun,
  PayrollRunDetail,
  PayrollSummary,
  Payslip,
  SalaryComponent,
  SalaryStructure,
  StatutoryRegister,
  UnassignedEmployee,
} from '../types';

const componentCrud = createCrudService<SalaryComponent>('/payroll/components');

const nullable = (value: string): string | null => value.trim() || null;

const toComponentPayload = (input: ComponentInput) => ({
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),
  type: input.type,
  calculation: input.calculation,
  value: input.value,
  // A deduction is never taxable income and never counts toward PF wages;
  // sending either as true would be a contradiction the API has to reject.
  is_taxable: input.type === 'earning' && input.is_taxable,
  affects_pf: input.type === 'earning' && input.affects_pf,
  is_active: input.is_active,
  sort_order: input.sort_order,
});

const toStructurePayload = (input: StructureInput) => ({
  employee_type: input.employee_type,
  employee_id: input.employee_id,
  basic: input.basic,
  effective_from: input.effective_from,
  pf_on_full_wage: input.pf_on_full_wage,
  pf_excluded: input.pf_excluded,
  lines: input.lines.map((line) => ({
    component_id: line.component_id,
    value: line.value,
  })),
  is_active: input.is_active,
});

export interface StructureQuery extends ListQueryParams {
  employee_type?: string;
}

export const payrollService = {
  // --- components ---

  listComponents: componentCrud.list,

  async components(signal?: AbortSignal): Promise<SalaryComponent[]> {
    const { data } = await http.get<CollectionResponse<SalaryComponent>>('/payroll/components', {
      params: { per_page: 'all' },
      signal,
    });
    return data.data;
  },

  async createComponent(input: ComponentInput): Promise<SalaryComponent> {
    const { data } = await http.post<ApiResource<SalaryComponent>>(
      '/payroll/components',
      toComponentPayload(input),
    );
    return data.data;
  },

  async updateComponent(id: number, input: ComponentInput): Promise<SalaryComponent> {
    const { data } = await http.put<ApiResource<SalaryComponent>>(
      `/payroll/components/${id}`,
      toComponentPayload(input),
    );
    return data.data;
  },

  removeComponent: componentCrud.remove,

  // --- salary structures ---

  async structures(
    params: StructureQuery = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<SalaryStructure>> {
    const { data } = await http.get<PaginatedResponse<SalaryStructure>>('/payroll/structures', {
      params,
      signal,
    });
    return data;
  },

  async structure(
    employeeType: string,
    employeeId: number,
    signal?: AbortSignal,
  ): Promise<SalaryStructure> {
    const { data } = await http.get<ApiResource<SalaryStructure>>(
      `/payroll/structures/${employeeType}/${employeeId}`,
      { signal },
    );
    return data.data;
  },

  /** Staff and teachers with no structure yet — the gap worth showing. */
  async unassigned(signal?: AbortSignal): Promise<UnassignedEmployee[]> {
    const { data } = await http.get<CollectionResponse<UnassignedEmployee>>(
      '/payroll/structures/unassigned',
      { signal },
    );
    return data.data;
  },

  /**
   * Save a structure.
   *
   * Returns the recomputed record: the gross, the deductions and the
   * statutory lines are all worked out from the basic, and a client that
   * patched one line and left the totals alone would drift within a click.
   */
  async saveStructure(input: StructureInput): Promise<SalaryStructure> {
    const { data } = await http.put<ApiResource<SalaryStructure>>(
      '/payroll/structures',
      toStructurePayload(input),
    );
    return data.data;
  },

  // --- runs ---

  async runs(params: ListQueryParams = {}, signal?: AbortSignal) {
    const { data } = await http.get<PaginatedResponse<PayrollRun>>('/payroll/runs', {
      params,
      signal,
    });
    return data;
  },

  async run(id: number | string, signal?: AbortSignal): Promise<PayrollRunDetail> {
    const { data } = await http.get<ApiResource<PayrollRunDetail>>(`/payroll/runs/${id}`, {
      signal,
    });
    return data.data;
  },

  async createRun(input: RunInput): Promise<PayrollRunDetail> {
    const { data } = await http.post<ApiResource<PayrollRunDetail>>('/payroll/runs', {
      month: input.month,
      notes: nullable(input.notes),
    });
    return data.data;
  },

  /**
   * Cost the month.
   *
   * Reads every active structure, applies the month's attendance for loss of
   * pay, and writes a payslip per employee — after which the figures are
   * frozen. Re-processing is allowed only while nobody has signed off.
   */
  async processRun(id: number): Promise<PayrollRunDetail> {
    const { data } = await http.post<ApiResource<PayrollRunDetail>>(
      `/payroll/runs/${id}/process`,
    );
    return data.data;
  },

  async approveRun(input: ApproveRunInput): Promise<PayrollRunDetail> {
    const { data } = await http.post<ApiResource<PayrollRunDetail>>(
      `/payroll/runs/${input.run_id}/approve`,
      { remarks: nullable(input.remarks) },
    );
    return data.data;
  },

  async markPaid(input: MarkPaidInput): Promise<PayrollRunDetail> {
    const { data } = await http.post<ApiResource<PayrollRunDetail>>(
      `/payroll/runs/${input.run_id}/pay`,
      { paid_on: input.paid_on, reference: nullable(input.reference) },
    );
    return data.data;
  },

  async removeRun(id: number): Promise<void> {
    await http.delete(`/payroll/runs/${id}`);
  },

  // --- payslips ---

  async payslip(id: number | string, signal?: AbortSignal): Promise<Payslip> {
    const { data } = await http.get<ApiResource<Payslip>>(`/payroll/payslips/${id}`, { signal });
    return data.data;
  },

  async downloadPayslip(payslip: Payslip): Promise<void> {
    await downloadFile(
      `/payroll/payslips/${payslip.id}/pdf`,
      `payslip-${payslip.employee_code}-${payslip.month}.pdf`,
    );
  },

  /** Every payslip in a run, as one file for the print room. */
  async downloadRunPayslips(runId: number, month: string): Promise<void> {
    await downloadFile(
      `/payroll/runs/${runId}/payslips`,
      timestampedFilename(`payslips-${month}`, 'pdf'),
    );
  },

  // --- statutory ---

  /**
   * The PF and ESI registers for a month.
   *
   * Derived from the run's payslips rather than recomputed: the return a
   * school files has to match the payslips it handed out, and two
   * calculations of the same month is one too many.
   */
  async register(month: string, signal?: AbortSignal): Promise<StatutoryRegister> {
    const { data } = await http.get<ApiResource<StatutoryRegister>>('/payroll/statutory', {
      params: { month },
      signal,
    });
    return data.data;
  },

  async exportRegister(month: string, scheme: 'pf' | 'esi'): Promise<void> {
    await downloadFile(
      '/payroll/statutory/export',
      timestampedFilename(`${scheme}-return-${month}`, 'xlsx'),
      { params: { month, scheme } },
    );
  },

  async summary(signal?: AbortSignal): Promise<PayrollSummary> {
    const { data } = await http.get<ApiResource<PayrollSummary>>('/payroll/summary', { signal });
    return data.data;
  },

  async exportRun(runId: number, month: string, format: 'pdf' | 'excel'): Promise<void> {
    await downloadFile(
      `/payroll/runs/${runId}/export`,
      timestampedFilename(`payroll-${month}`, format === 'excel' ? 'xlsx' : 'pdf'),
      { params: { format } },
    );
  },
};

export type { ListQueryParams };
