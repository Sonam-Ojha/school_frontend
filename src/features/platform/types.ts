import type { Access, BillingCycle, ModuleKey, SubscriptionState } from '@/features/saas/types';

/** The platform console's view of things, as `/api/v1/platform/…` returns them. */

export type PlatformRole = 'owner' | 'support' | 'billing' | 'sales';

export type PlatformRight =
  | 'schools.read'
  | 'schools.create'
  | 'schools.update'
  | 'schools.trial'
  | 'schools.suspend'
  | 'schools.restart'
  | 'schools.impersonate'
  | 'schools.delete'
  | 'plans.read'
  | 'plans.manage'
  | 'billing.read'
  | 'billing.manage'
  | 'reports.read'
  | 'leads.read'
  | 'leads.manage'
  | 'tickets.read'
  | 'tickets.manage'
  | 'audit.read'
  | 'team.manage'
  | 'settings.manage';

export interface PlatformUser {
  id: number;
  name: string;
  email: string;
  role: PlatformRole;
  role_label: string;
  rights: 'all' | PlatformRight[];
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export type SchoolStatus = 'trial' | 'active' | 'suspended' | 'cancelled';
export type RuntimeStatus = 'running' | 'starting' | 'stopped' | 'failed';

export interface SchoolUsage {
  students: number;
  students_total: number;
  teachers: number;
  staff: number;
  users: number;
  classes: number;
  storage_bytes: number;
  school_name: string | null;
  logo_url: string | null;
  at: string;
}

export interface Limits {
  max_students: number | null;
  max_users: number | null;
  max_storage_mb: number | null;
}

export interface Reminder {
  at: string;
  kind: 'due_soon' | 'due_today' | 'overdue' | 'trial_ending' | 'trial_ended' | 'manual';
  sent: boolean;
  detail: string;
}

export interface SchoolRef {
  id: number;
  code: string;
  name: string;
}

export interface PlatformSchool {
  id: number;
  code: string;
  name: string;
  status: SchoolStatus;
  subscription: { state: SubscriptionState; access: Access; days_left: number | null };
  plan: { id: number; code: string; name: string } | null;
  billing_cycle: BillingCycle;
  trial_ends_at: string | null;
  current_period_end: string | null;
  admin_email: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  region: string;
  country: string;
  gstin: string;
  custom_domain: string | null;
  url: string;
  demo_login: boolean;
  simulate: boolean;
  modules: ModuleKey[];
  limits: Limits;
  limits_override: Limits | null;
  usage: SchoolUsage | null;
  runtime: { status: RuntimeStatus; started_at: string | null; error: string | null };
  mrr: number;
  notes: string;
  suspended_reason: string | null;
  source: 'signup' | 'platform' | 'import' | 'sample';
  seed: 'clean' | 'demo' | 'showcase' | 'existing';
  provisioned_at: string | null;
  reminders: Reminder[];
  created_at: string;
  updated_at: string;
}

export interface PlatformPlan {
  id: number;
  code: string;
  name: string;
  tagline: string;
  price_monthly: number;
  price_yearly: number;
  max_students: number | null;
  max_users: number | null;
  max_storage_mb: number | null;
  modules: ModuleKey[];
  features: string[];
  is_featured: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
  schools_count: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  description: string;
  sac: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PlatformInvoice {
  id: number;
  number: string;
  school_id: number;
  school: SchoolRef | null;
  plan_id: number;
  plan_name: string;
  billing_cycle: BillingCycle;
  period_start: string;
  period_end: string;
  lines: InvoiceLine[];
  amount: number;
  discount: number;
  taxable: number;
  tax_percent: number;
  cgst: number;
  sgst: number;
  igst: number;
  tax: number;
  total: number;
  currency: string;
  place_of_supply: string;
  buyer: { name: string; address: string; city: string; region: string; gstin: string; email: string; phone: string };
  status: 'open' | 'paid' | 'void';
  due_date: string;
  issued_at: string;
  paid_at: string | null;
  notes: string;
  created_by: 'system' | 'platform' | 'school';
  reminders: Reminder[];
  amount_paid: number;
  balance_due: number;
  overdue: boolean;
}

export type PaymentMethod = 'upi' | 'bank_transfer' | 'cheque' | 'cash' | 'card' | 'razorpay';

export interface PlatformPayment {
  id: number;
  invoice_id: number;
  invoice_number: string | null;
  school_id: number;
  school: SchoolRef | null;
  amount: number;
  method: PaymentMethod;
  reference: string;
  paid_on: string;
  recorded_by: number | null;
  gateway_order_id: string | null;
  created_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'demo_scheduled' | 'won' | 'lost';

export interface PlatformLead {
  id: number;
  name: string;
  school_name: string;
  email: string;
  phone: string;
  city: string;
  students: number | null;
  message: string;
  status: LeadStatus;
  notes: string;
  source: 'website' | 'upgrade';
  school: SchoolRef | null;
  assigned_to: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface TicketMessage {
  id: number;
  from: 'school' | 'platform';
  author_name: string;
  author_email: string;
  body: string;
  at: string;
}

export interface PlatformTicket {
  id: number;
  number: string;
  subject: string;
  category: 'technical' | 'billing' | 'account' | 'feature' | 'other';
  priority: TicketPriority;
  status: TicketStatus;
  raised_by: { name: string; email: string; user_id: number };
  school: SchoolRef | null;
  assigned_to: { id: number; name: string } | null;
  messages: TicketMessage[];
  last_message_at: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface PlatformActivity {
  id: number;
  at: string;
  actor: string;
  actor_type: 'platform' | 'school' | 'website' | 'system';
  ip: string | null;
  school_id: number | null;
  school: SchoolRef | null;
  action: string;
  detail: string;
}

export interface PlatformOverview {
  schools: { total: number; by_state: Record<SubscriptionState, number>; running: number };
  revenue: {
    mrr: number;
    arr: number;
    collected_this_month: number;
    collected_total: number;
    outstanding: number;
    overdue_invoices: number;
  };
  usage: { students: number; teachers: number; staff: number; users: number };
  plans: Array<{ id: number; name: string; schools: number; mrr: number }>;
  monthly: Array<{ month: string; label: string; revenue: number; signups: number }>;
  trials_ending: PlatformSchool[];
  renewals_due: PlatformSchool[];
  recent_schools: PlatformSchool[];
  recent_activity: PlatformActivity[];
  new_leads: number;
  open_tickets: number;
}

export interface SchoolDetail {
  school: PlatformSchool;
  invoices: PlatformInvoice[];
  payments: PlatformPayment[];
  tickets: PlatformTicket[];
  activity: PlatformActivity[];
}

export interface Renewals {
  upcoming: Array<{ school: PlatformSchool; renewal_invoice: PlatformInvoice | null }>;
  trials: PlatformSchool[];
  overdue: PlatformInvoice[];
}

export interface RevenueReport {
  from: string;
  to: string;
  totals: { invoiced: number; taxable: number; gst: number; collected: number; outstanding: number };
  months: Array<{ month: string; label: string; invoiced: number; taxable: number; gst: number; collected: number; invoices: number }>;
  by_plan: Array<{ plan: string; invoiced: number; collected: number }>;
  by_school: Array<{ school: SchoolRef; invoiced: number; collected: number; outstanding: number }>;
  payments: PlatformPayment[];
}

export interface PlatformMeta {
  modules: Array<{ key: ModuleKey; name: string; description: string }>;
  roles: Array<{ key: PlatformRole; label: string; description: string }>;
  gst_states: Array<{ code: string; name: string }>;
  online_payments: boolean;
  platform_mail: boolean;
  root_domain: string | null;
}

export interface PlatformSettings {
  brand_name: string;
  brand_logo_url: string;
  brand_color: string;
  company_name: string;
  company_address: string;
  company_state: string;
  gstin: string;
  pan: string;
  support_email: string;
  support_phone: string;
  tax_percent: number;
  sac_code: string;
  invoice_prefix: string;
  currency: string;
  trial_days: number;
  grace_days: number;
  renewal_notice_days: number;
  invoice_due_days: number;
  signup_enabled: boolean;
  payment_instructions: string;
  default_school_id: number | null;
  updated_at: string;
}

export interface NewSchoolInput {
  name: string;
  code: string;
  address: string;
  city: string;
  region: string;
  gstin: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  admin_password: string;
  plan_id: number;
  billing_cycle: BillingCycle;
  status: 'trial' | 'active';
  trial_days: number;
  seed: 'clean' | 'demo' | 'showcase';
  demo_login: boolean;
  simulate: boolean;
}

export type SchoolPatch = Partial<{
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  region: string;
  gstin: string;
  custom_domain: string;
  plan_id: number;
  billing_cycle: BillingCycle;
  status: SchoolStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  limits_override: Limits | null;
  demo_login: boolean;
  simulate: boolean;
  notes: string;
}>;

export interface PlanInput {
  code: string;
  name: string;
  tagline: string;
  price_monthly: number;
  price_yearly: number;
  max_students: number | null;
  max_users: number | null;
  max_storage_mb: number | null;
  modules: ModuleKey[];
  features: string[];
  is_featured: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface InvoiceInput {
  plan_id: number;
  billing_cycle: BillingCycle;
  period_start: string;
  amount?: number | null;
  discount?: number | null;
  due_days?: number | null;
  notes?: string;
}

export interface PaymentInput {
  amount: number;
  method: PaymentMethod;
  reference: string;
  paid_on: string;
}

export interface TeamInput {
  name: string;
  email: string;
  role: PlatformRole;
  password: string;
}
