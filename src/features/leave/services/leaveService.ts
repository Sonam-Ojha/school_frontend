import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type {
  ApiResource,
  CollectionResponse,
  ListQueryParams,
  PaginatedResponse,
} from '@/types/api';

import type { ApplicationInput, CancelInput, LeaveTypeInput, ReviewInput } from '../schemas';
import type {
  ApplicantType,
  AwayToday,
  LeaveApplication,
  LeaveBalance,
  LeaveReport,
  LeaveSummary,
  LeaveType,
} from '../types';

const typeCrud = createCrudService<LeaveType>('/leave/types');

const nullable = (value: string): string | null => value.trim() || null;

/** Blank optional numbers are "no limit", not zero. */
const optionalNumber = (value: string): number | null =>
  value.trim() === '' ? null : Number(value);

const toTypePayload = (input: LeaveTypeInput) => ({
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),
  applies_to: input.applies_to,
  annual_quota: optionalNumber(input.annual_quota),
  is_paid: input.is_paid,
  requires_document: input.requires_document,
  allows_backdated: input.allows_backdated,
  max_consecutive_days: optionalNumber(input.max_consecutive_days),
  is_active: input.is_active,
});

export interface BalanceQuery extends ListQueryParams {
  applicant_type?: ApplicantType;
}

export interface ReportQuery {
  from: string;
  to: string;
  applicantType?: ApplicantType | null;
}

export const leaveService = {
  // --- leave types ---

  listTypes: typeCrud.list,

  async types(signal?: AbortSignal): Promise<LeaveType[]> {
    const { data } = await http.get<CollectionResponse<LeaveType>>('/leave/types', {
      params: { per_page: 'all' },
      signal,
    });
    return data.data;
  },

  async createType(input: LeaveTypeInput): Promise<LeaveType> {
    const { data } = await http.post<ApiResource<LeaveType>>('/leave/types', toTypePayload(input));
    return data.data;
  },

  async updateType(id: number, input: LeaveTypeInput): Promise<LeaveType> {
    const { data } = await http.put<ApiResource<LeaveType>>(
      `/leave/types/${id}`,
      toTypePayload(input),
    );
    return data.data;
  },

  removeType: typeCrud.remove,

  // --- applications ---

  async applications(params: ListQueryParams = {}, signal?: AbortSignal) {
    const { data } = await http.get<PaginatedResponse<LeaveApplication>>('/leave/applications', {
      params,
      signal,
    });
    return data;
  },

  async application(id: number | string, signal?: AbortSignal): Promise<LeaveApplication> {
    const { data } = await http.get<ApiResource<LeaveApplication>>(
      `/leave/applications/${id}`,
      { signal },
    );
    return data.data;
  },

  async apply(input: ApplicationInput): Promise<LeaveApplication> {
    const { data } = await http.post<ApiResource<LeaveApplication>>('/leave/applications', {
      applicant_type: input.applicant_type,
      applicant_id: input.applicant_id,
      leave_type_id: input.leave_type_id,
      from_date: input.from_date,
      to_date: input.to_date,
      day_portion: input.day_portion,
      reason: input.reason.trim(),
      document_name: nullable(input.document_name),
    });
    return data.data;
  },

  /**
   * How many working days a request would actually consume.
   *
   * Asked as the form is filled in, because holidays and weekends come out —
   * a "week off" over the mid-term break costs two days, and knowing that
   * before applying is worth more than discovering it in a balance.
   */
  async previewDays(
    fromDate: string,
    toDate: string,
    applicantType: ApplicantType,
    dayPortion: string,
    signal?: AbortSignal,
  ): Promise<{ days: number; working_days: number; excluded: string[] }> {
    const { data } = await http.get<
      ApiResource<{ days: number; working_days: number; excluded: string[] }>
    >('/leave/applications/preview', {
      params: {
        from_date: fromDate,
        to_date: toDate,
        applicant_type: applicantType,
        day_portion: dayPortion,
      },
      signal,
    });
    return data.data;
  },

  /** Approve or refuse. One endpoint, because it is one decision. */
  async review(input: ReviewInput): Promise<LeaveApplication> {
    const { data } = await http.post<ApiResource<LeaveApplication>>(
      `/leave/applications/${input.application_id}/review`,
      { decision: input.decision, note: nullable(input.note) },
    );
    return data.data;
  },

  /** The applicant pulling a request back before anybody has decided. */
  async withdraw(id: number): Promise<LeaveApplication> {
    const { data } = await http.post<ApiResource<LeaveApplication>>(
      `/leave/applications/${id}/withdraw`,
    );
    return data.data;
  },

  /** Undoing an approval, which is only possible before the leave begins. */
  async cancel(input: CancelInput): Promise<LeaveApplication> {
    const { data } = await http.post<ApiResource<LeaveApplication>>(
      `/leave/applications/${input.application_id}/cancel`,
      { reason: input.reason.trim() },
    );
    return data.data;
  },

  async removeApplication(id: number): Promise<void> {
    await http.delete(`/leave/applications/${id}`);
  },

  // --- balances ---

  async balances(query: BalanceQuery = {}, signal?: AbortSignal) {
    const { data } = await http.get<PaginatedResponse<LeaveBalance>>('/leave/balances', {
      params: query,
      signal,
    });
    return data;
  },

  async balance(
    applicantType: ApplicantType,
    applicantId: number,
    signal?: AbortSignal,
  ): Promise<LeaveBalance> {
    const { data } = await http.get<ApiResource<LeaveBalance>>(
      `/leave/balances/${applicantType}/${applicantId}`,
      { signal },
    );
    return data.data;
  },

  // --- reports ---

  async report(query: ReportQuery, signal?: AbortSignal): Promise<LeaveReport> {
    const { data } = await http.get<ApiResource<LeaveReport>>('/leave/reports/usage', {
      params: {
        from: query.from,
        to: query.to,
        ...(query.applicantType ? { applicant_type: query.applicantType } : {}),
      },
      signal,
    });
    return data.data;
  },

  /** Who is away right now — the question a school asks every morning. */
  async awayToday(applicantType?: ApplicantType | null, signal?: AbortSignal): Promise<AwayToday[]> {
    const { data } = await http.get<CollectionResponse<AwayToday>>('/leave/reports/away', {
      params: applicantType ? { applicant_type: applicantType } : {},
      signal,
    });
    return data.data;
  },

  async summary(signal?: AbortSignal): Promise<LeaveSummary> {
    const { data } = await http.get<ApiResource<LeaveSummary>>('/leave/summary', { signal });
    return data.data;
  },

  async exportApplications(params: ListQueryParams, format: 'pdf' | 'excel'): Promise<void> {
    await downloadFile(
      '/leave/applications/export',
      timestampedFilename('leave-register', format === 'excel' ? 'xlsx' : 'pdf'),
      { params: { ...params, format } },
    );
  },

  async exportReport(query: ReportQuery, format: 'pdf' | 'excel'): Promise<void> {
    await downloadFile(
      '/leave/reports/usage/export',
      timestampedFilename(`leave-usage-${query.from}-to-${query.to}`, format === 'excel' ? 'xlsx' : 'pdf'),
      {
        params: {
          from: query.from,
          to: query.to,
          ...(query.applicantType ? { applicant_type: query.applicantType } : {}),
          format,
        },
      },
    );
  },
};

export type { ListQueryParams };
