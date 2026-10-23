/** The platform's view of things, as the website and the schools see it. */

export type ModuleKey =
  | 'assignments'
  | 'leave'
  | 'library'
  | 'transport'
  | 'payroll'
  | 'analytics'
  | 'hostel'
  | 'devices';

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
  max_students: number | null;
  modules: ModuleKey[];
  features: string[];
  is_featured: boolean;
}

export interface SaasConfig {
  brand_name: string;
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
}

export interface Subscription {
  school: { id: number; code: string; name: string; city: string };
  plan: PublicPlan;
  billing_cycle: BillingCycle;
  state: SubscriptionState;
  access: Access;
  /** Days left in the trial or the paid period; negative once it has passed. */
  days_left: number | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  grace_days: number;
  modules: ModuleKey[];
  limits: { max_students: number | null };
  usage: {
    students: number;
    teachers: number;
    staff: number;
    users: number;
    storage_bytes: number;
  } | null;
  /** Only for the school's administrators. */
  invoices: SchoolInvoice[] | null;
  can_manage: boolean;
  payments: {
    online: boolean;
    key_id: string | null;
    instructions: string;
  };
}

export interface SchoolInvoice {
  id: number;
  number: string;
  plan_name: string;
  billing_cycle: BillingCycle;
  period_start: string;
  period_end: string;
  amount: number;
  tax_percent: number;
  tax: number;
  total: number;
  currency: string;
  status: 'open' | 'paid' | 'void';
  due_date: string;
  issued_at: string;
  paid_at: string | null;
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
