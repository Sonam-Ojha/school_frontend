import axios, { type AxiosInstance } from 'axios';

import { env } from '@/config/env';
import { toApiError } from '@/lib/apiError';
import { saveBlob } from '@/lib/download';
import type { ApiResource, CollectionResponse } from '@/types/api';

import { usePlatformAuth } from './store';
import type {
  InvoiceInput,
  LeadStatus,
  NewSchoolInput,
  PaymentInput,
  PlanInput,
  PlatformActivity,
  PlatformInvoice,
  PlatformLead,
  PlatformMeta,
  PlatformOverview,
  PlatformPayment,
  PlatformPlan,
  PlatformRight,
  PlatformSchool,
  PlatformSettings,
  PlatformTicket,
  PlatformUser,
  Renewals,
  RevenueReport,
  SchoolDetail,
  SchoolPatch,
  TeamInput,
  TicketPriority,
  TicketStatus,
} from './types';

/** The console's own client: the platform token, and only to `/platform/…`. */
const api: AxiosInstance = axios.create({
  baseURL: `${env.apiBaseUrl}/platform`,
  timeout: 15 * 60_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = usePlatformAuth.getState().token;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // A failed download arrives as a Blob; read it back into the usual error.
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        /* not JSON: the status message will do */
      }
    }
    const apiError = toApiError(error);
    const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : '';
    // An expired console session: back to its sign-in page.
    if (apiError.isUnauthorized && !url.includes('/auth/login')) usePlatformAuth.getState().clear();
    return Promise.reject(apiError);
  },
);

const one = <T,>(promise: Promise<{ data: ApiResource<T> }>): Promise<T> => promise.then((response) => response.data.data);
const many = <T,>(promise: Promise<{ data: CollectionResponse<T> }>): Promise<T[]> => promise.then((response) => response.data.data);
/** For actions whose answer is a sentence worth showing. */
const said = <T,>(promise: Promise<{ data: ApiResource<T> & { message: string } }>): Promise<{ message: string; data: T }> =>
  promise.then((response) => ({ message: response.data.message, data: response.data.data }));

export const platformApi = {
  // --- session ---------------------------------------------------------------
  login: (input: { email: string; password: string; remember: boolean }) =>
    one<{ user: PlatformUser; token: string; expires_at: string }>(api.post('/auth/login', input)),
  me: (signal?: AbortSignal) => one<PlatformUser>(api.get('/auth/me', { signal })),
  /** What the sign-in page offers in a presentation; `enabled` is false on a real platform. */
  demo: (signal?: AbortSignal) =>
    one<{ enabled: boolean; accounts: Array<{ email: string; name: string; role: string; role_label: string; password: string | null }> }>(
      api.get('/auth/demo', { signal }),
    ),
  demoLogin: (email: string) =>
    one<{ user: PlatformUser; token: string; expires_at: string }>(api.post('/auth/demo-login', { email })),
  logout: () => api.post('/auth/logout'),
  changePassword: (input: { current_password: string; password: string; password_confirmation: string }) =>
    said<null>(api.put('/auth/password', input)),
  meta: (signal?: AbortSignal) => one<PlatformMeta>(api.get('/meta', { signal })),

  // --- overview and reports ----------------------------------------------------
  overview: (signal?: AbortSignal) => one<PlatformOverview>(api.get('/overview', { signal })),
  revenue: (params: { from?: string; to?: string }, signal?: AbortSignal) =>
    one<RevenueReport>(api.get('/reports/revenue', { params, signal })),

  // --- schools ---------------------------------------------------------------
  schools: (params: { search?: string; status?: string; plan_id?: number } = {}, signal?: AbortSignal) =>
    many<PlatformSchool>(api.get('/schools', { params, signal })),
  school: (id: number, signal?: AbortSignal) => one<SchoolDetail>(api.get(`/schools/${id}`, { signal })),
  createSchool: (input: NewSchoolInput) => said<PlatformSchool>(api.post('/schools', input)),
  updateSchool: (id: number, patch: SchoolPatch) => said<PlatformSchool>(api.put(`/schools/${id}`, patch)),
  suspendSchool: (id: number, reason: string) => said<PlatformSchool>(api.post(`/schools/${id}/suspend`, { reason })),
  activateSchool: (id: number) => said<PlatformSchool>(api.post(`/schools/${id}/activate`)),
  extendTrial: (id: number, days: number) => said<PlatformSchool>(api.post(`/schools/${id}/extend-trial`, { days })),
  restartSchool: (id: number) => said<PlatformSchool>(api.post(`/schools/${id}/restart`)),
  remindSchool: (id: number) => said<PlatformSchool>(api.post(`/schools/${id}/remind`)),
  deleteSchool: (id: number, confirm: string) => said<null>(api.delete(`/schools/${id}`, { data: { confirm } })),
  /** A one-time sign-in to the school as its administrator, for support. */
  impersonate: (id: number) =>
    said<{ token: string; code: string; user: { name: string; email: string } }>(api.post(`/schools/${id}/impersonate`)),

  // --- plans -----------------------------------------------------------------
  plans: (signal?: AbortSignal) => many<PlatformPlan>(api.get('/plans', { signal })),
  createPlan: (input: PlanInput) => said<PlatformPlan>(api.post('/plans', input)),
  updatePlan: (id: number, input: Partial<PlanInput>) => said<PlatformPlan>(api.put(`/plans/${id}`, input)),
  deletePlan: (id: number) => said<null>(api.delete(`/plans/${id}`)),

  // --- billing ---------------------------------------------------------------
  invoices: (params: { status?: string; school_id?: number } = {}, signal?: AbortSignal) =>
    many<PlatformInvoice>(api.get('/invoices', { params, signal })),
  createInvoice: (schoolId: number, input: InvoiceInput) => said<PlatformInvoice>(api.post(`/schools/${schoolId}/invoices`, input)),
  recordPayment: (invoiceId: number, input: PaymentInput) => said<PlatformInvoice>(api.post(`/invoices/${invoiceId}/payments`, input)),
  voidInvoice: (invoiceId: number) => said<PlatformInvoice>(api.post(`/invoices/${invoiceId}/void`)),
  remindInvoice: (invoiceId: number) => said<PlatformInvoice>(api.post(`/invoices/${invoiceId}/remind`)),
  async downloadInvoice(invoice: { id: number; number: string }): Promise<void> {
    const response = await api.get<Blob>(`/invoices/${invoice.id}/pdf`, { responseType: 'blob' });
    saveBlob(response.data, `${invoice.number.replace(/\//g, '-')}.pdf`);
  },
  payments: (signal?: AbortSignal) => many<PlatformPayment>(api.get('/payments', { signal })),
  renewals: (signal?: AbortSignal) => one<Renewals>(api.get('/renewals', { signal })),

  // --- enquiries and tickets ---------------------------------------------------
  leads: (signal?: AbortSignal) => many<PlatformLead>(api.get('/leads', { signal })),
  updateLead: (id: number, patch: { status?: LeadStatus; notes?: string; assigned_to?: number | null }) =>
    said<PlatformLead>(api.put(`/leads/${id}`, patch)),
  deleteLead: (id: number) => said<null>(api.delete(`/leads/${id}`)),
  tickets: (params: { status?: string } = {}, signal?: AbortSignal) => many<PlatformTicket>(api.get('/tickets', { params, signal })),
  ticket: (id: number, signal?: AbortSignal) => one<PlatformTicket>(api.get(`/tickets/${id}`, { signal })),
  replyTicket: (id: number, body: string) => said<PlatformTicket>(api.post(`/tickets/${id}/messages`, { body })),
  updateTicket: (id: number, patch: { status?: TicketStatus; priority?: TicketPriority; assigned_to?: number | null }) =>
    said<PlatformTicket>(api.put(`/tickets/${id}`, patch)),

  // --- audit, team, settings ----------------------------------------------------
  activity: (params: { school_id?: number; action?: string; search?: string; limit?: number } = {}, signal?: AbortSignal) =>
    many<PlatformActivity>(api.get('/activity', { params, signal })),
  team: (signal?: AbortSignal) => many<PlatformUser>(api.get('/team', { signal })),
  addTeamMember: (input: TeamInput) => said<PlatformUser>(api.post('/team', input)),
  updateTeamMember: (id: number, patch: Partial<TeamInput> & { is_active?: boolean }) => said<PlatformUser>(api.put(`/team/${id}`, patch)),
  removeTeamMember: (id: number) => said<null>(api.delete(`/team/${id}`)),
  settings: (signal?: AbortSignal) => one<PlatformSettings>(api.get('/settings', { signal })),
  updateSettings: (input: Partial<PlatformSettings>) => said<PlatformSettings>(api.put('/settings', input)),
};

export const platformKeys = {
  all: ['platform'] as const,
  me: () => [...platformKeys.all, 'me'] as const,
  meta: () => [...platformKeys.all, 'meta'] as const,
  overview: () => [...platformKeys.all, 'overview'] as const,
  revenue: (params: object) => [...platformKeys.all, 'revenue', params] as const,
  schools: (params: object = {}) => [...platformKeys.all, 'schools', params] as const,
  school: (id: number) => [...platformKeys.all, 'school', id] as const,
  plans: () => [...platformKeys.all, 'plans'] as const,
  invoices: (params: object = {}) => [...platformKeys.all, 'invoices', params] as const,
  payments: () => [...platformKeys.all, 'payments'] as const,
  renewals: () => [...platformKeys.all, 'renewals'] as const,
  leads: () => [...platformKeys.all, 'leads'] as const,
  tickets: (params: object = {}) => [...platformKeys.all, 'tickets', params] as const,
  ticket: (id: number) => [...platformKeys.all, 'ticket', id] as const,
  activity: (params: object = {}) => [...platformKeys.all, 'activity', params] as const,
  team: () => [...platformKeys.all, 'team'] as const,
  settings: () => [...platformKeys.all, 'settings'] as const,
};

/** Whether the signed-in member of the team holds `right`. */
export function can(user: PlatformUser | null, right: PlatformRight): boolean {
  if (!user) return false;
  return user.rights === 'all' || user.rights.includes(right);
}
