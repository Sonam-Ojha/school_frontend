/**
 * Fee management.
 *
 * The shape follows the money: a **structure** says what a class owes, split
 * into **instalments** with due dates. Each student picks up their class's
 * structure as a set of **dues**. A **payment** settles one or more dues and
 * produces a **receipt**. Discounts reduce a due; fines increase it.
 *
 * Every amount is a major-unit decimal on the wire and goes through
 * `lib/money.ts` before any arithmetic.
 */

export type FeeCategory =
  | 'tuition'
  | 'admission'
  | 'transport'
  | 'hostel'
  | 'examination'
  | 'library'
  | 'laboratory'
  | 'activity'
  | 'other';

export type FeeFrequency = 'one_time' | 'monthly' | 'quarterly' | 'half_yearly' | 'annual';

export interface FeeType {
  id: number;
  name: string;
  code: string;
  category: FeeCategory;
  /** Charged every term rather than once at admission. */
  is_recurring: boolean;
  is_refundable: boolean;
  is_active: boolean;
  description: string | null;
  /** Structures currently using it — blocks deletion. */
  structures_count: number;
  created_at: string;
}

export interface FeeStructureItem {
  id: number;
  fee_type_id: number;
  fee_type_name: string;
  fee_type_code: string;
  amount: number;
  frequency: FeeFrequency;
}

export interface Installment {
  id: number;
  /** 1-based position, used for ordering and receipt labels. */
  sequence: number;
  name: string;
  due_date: string;
  amount: number;
}

export interface FeeStructure {
  id: number;
  name: string;
  academic_year_id: number;
  academic_year_name: string;
  class_id: number;
  class_name: string;
  /** Null means the structure applies to every section of the class. */
  section_id: number | null;
  section_name: string | null;
  is_active: boolean;
  /** Sum of the items, computed by the API. */
  total_amount: number;
  items_count: number;
  installments_count: number;
  /** Students currently assigned — blocks deletion. */
  students_count: number;
  created_at: string;
  updated_at: string;
}

/** `GET /fees/structures/{id}` — adds the lines and the schedule. */
export interface FeeStructureDetail extends FeeStructure {
  items: FeeStructureItem[];
  installments: Installment[];
}

export type DiscountValueType = 'percentage' | 'fixed';

export interface Discount {
  id: number;
  name: string;
  code: string;
  value_type: DiscountValueType;
  /** A percentage (0–100) or a fixed major-unit amount. */
  value: number;
  description: string | null;
  is_active: boolean;
  /** Times currently applied — blocks deletion. */
  usages_count: number;
  created_at: string;
}

export type DueStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'waived';

/** One instalment as it stands for one student. */
export interface StudentDue {
  id: number;
  installment_id: number;
  installment_name: string;
  sequence: number;
  due_date: string;
  /** Before discount and fine. */
  gross_amount: number;
  discount_amount: number;
  /** Accrued from the overdue rule, or added by hand at collection. */
  fine_amount: number;
  /** `gross - discount + fine`. */
  payable_amount: number;
  paid_amount: number;
  balance: number;
  status: DueStatus;
  /** Whole days past the due date; zero when not overdue. */
  days_overdue: number;
}

/** A student's whole fee position for the current year. */
export interface StudentFeeAccount {
  student_id: number;
  student_name: string;
  admission_no: string;
  photo_url: string | null;
  class_name: string;
  section_name: string | null;
  structure_id: number | null;
  structure_name: string | null;
  total_payable: number;
  total_discount: number;
  total_fine: number;
  total_paid: number;
  balance: number;
  dues: StudentDue[];
}

export type PaymentMode = 'cash' | 'cheque' | 'card' | 'upi' | 'bank_transfer' | 'online';

export interface PaymentAllocation {
  due_id: number;
  installment_name: string;
  amount: number;
}

export interface Payment {
  id: number;
  receipt_no: string;
  student_id: number;
  student_name: string;
  admission_no: string;
  class_name: string;
  section_name: string | null;
  paid_at: string;
  amount: number;
  discount_amount: number;
  fine_amount: number;
  mode: PaymentMode;
  /** Cheque number, UPI reference, transaction id. */
  reference: string | null;
  remarks: string | null;
  collected_by: string;
  is_cancelled: boolean;
  cancelled_reason: string | null;
  allocations: PaymentAllocation[];
}

/** One row of the outstanding-dues report. */
export interface DueReportRow {
  student_id: number;
  student_name: string;
  admission_no: string;
  class_name: string;
  section_name: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  total_payable: number;
  total_paid: number;
  balance: number;
  /** Age of the oldest unpaid instalment. */
  days_overdue: number;
  overdue_installments: number;
}

export interface DueReportTotals {
  students: number;
  total_payable: number;
  total_paid: number;
  total_outstanding: number;
  overdue_students: number;
}
