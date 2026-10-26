/** The platform's view of things, as the website and the schools see it. */

/** What a plan may or may not include: eight parts of the app, then four services around it. */
export type ModuleKey =
  | 'assignments'
  | 'leave'
  | 'library'
  | 'transport'
  | 'payroll'
  | 'analytics'
  | 'hostel'
  | 'devices'
  | 'whatsapp'
  | 'priority_support'
  | 'custom_domain'
  | 'account_manager';

export type BillingCycle = 'monthly' | 'yearly';

/**
 * Where a school stands, as worked out from its status and dates:
 * `full` access, `read_only` (unpaid or trial over), or `blocked` (suspended).
 */
export type Access = 'full' | 'read_only' | 'blocked';

export type SubscriptionState =
  | 'trial'
  | 'trial_expired'
  | 'active'
  | 'past_due'
  | 'expired'
  | 'suspended'
  | 'cancelled';

export interface PublicPlan {
  id: number;
  code: string;
  name: string;
  tagline: string;
  price_monthly: number;
  price_yearly: number;
  /** Null is unlimited. */
  max_students: number | null;
  max_users?: number | null;
  max_storage_mb?: number | null;
  modules: ModuleKey[];
  features: string[];
  is_featured: boolean;
}

export interface SaasConfig {
  brand_name: string;
  brand_logo_url?: string | null;
  brand_color?: string;
  support_email: string;
  support_phone: string;
  currency: string;
  trial_days: number;
  signup_enabled: boolean;
  demo_school: { code: string; name: string } | null;
  root_domain: string | null;
  modules: Array<{ key: ModuleKey; name: string; description: string }>;
}

/** What anybody may know about a school from its code: enough to brand its sign-in page. */
export interface SchoolInfo {
  code: string;
  name: string;
  city: string;
  logo_url: string | null;
  access: Access;
  state: SubscriptionState;
  demo_login: boolean;
  /** The optional modules on the school's plan. */
  modules?: ModuleKey[];
}

export interface PlanLimits {
  max_students: number | null;
  max_users: number | null;
  max_storage_mb: number | null;
}

export interface SchoolUsage {
  students: number;
  teachers: number;
  staff: number;
  users: number;
  storage_bytes: number;
}

export interface Subscription {
  school: { id: number; code: string; name: string; city: string };
  plan: PublicPlan | null;
  billing_cycle: BillingCycle;
  state: SubscriptionState;
  access: Access;
  /** Days left in the trial or the paid period; negative once it has passed. */
  days_left: number | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  grace_days: number;
  modules: ModuleKey[];
  limits: PlanLimits;
  usage: SchoolUsage | null;
  /** The oldest unpaid invoice, for the banner and the pay button. */
  open_invoice: {
    id: number;
    number: string;
    total: number;
    balance_due: number;
    due_date: string;
    overdue: boolean;
  } | null;
  /** Only for the school's administrators. */
  invoices: SchoolInvoice[] | null;
  can_manage: boolean;
  payments: {
    online: boolean;
    key_id: string | null;
    instructions: string;
  };
  /** `priority`: the plan includes priority support. */
  support: { email: string; phone: string; priority?: boolean };
  /** The school's own contact in the platform team, on a plan with an account manager. */
  account_manager?: { name: string; email: string } | null;
}

export interface InvoiceLine {
  description: string;
  sac: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface SchoolInvoice {
  id: number;
  number: string;
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
  status: 'open' | 'paid' | 'void';
  due_date: string;
  issued_at: string;
  paid_at: string | null;
  notes: string;
  amount_paid: number;
  balance_due: number;
  overdue: boolean;
}

export type TicketCategory = 'technical' | 'billing' | 'account' | 'feature' | 'other';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export interface TicketMessage {
  id: number;
  from: 'school' | 'platform';
  author_name: string;
  author_email: string;
  body: string;
  at: string;
}

export interface SupportTicket {
  id: number;
  number: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  raised_by: { name: string; email: string; user_id: number };
  messages: TicketMessage[];
  last_message_at: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface NewTicketInput {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  message: string;
}

export interface SignupInput {
  school_name: string;
  code: string;
  city: string;
  state: string;
  contact_name: string;
  email: string;
  phone: string;
  password: string;
  plan_id: number;
  billing_cycle: BillingCycle;
  sample_data: boolean;
}

export interface SignupResult {
  school: { code: string; name: string };
  admin_email: string;
  trial_ends_at: string | null;
}

export interface LeadInput {
  name: string;
  school_name: string;
  email: string;
  phone: string;
  city: string;
  students: number | null;
  message: string;
}
