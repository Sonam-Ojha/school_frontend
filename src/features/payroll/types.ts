/**
 * Payroll.
 *
 * Four records. A **component** is a line a school pays or withholds — HRA,
 * conveyance, professional tax — defined once and applied to many people. A
 * **structure** is one employee's standing salary: a basic, plus the
 * components that apply to them. A **run** is one month's payroll. A
 * **payslip** is what one employee got in that month, and it is frozen the
 * moment the run is processed.
 *
 * Employees are not a record here. Teachers and non-teaching staff already
 * exist as two rosters, and a third table of the same people would be a third
 * place for a name, a bank account or a designation to go stale. The
 * structure carries an `employee_type` discriminator, the same shape the
 * library uses over its borrowers.
 */

export type EmployeeType = 'teacher' | 'staff';

export type ComponentType = 'earning' | 'deduction';

/**
 * How a component's amount is worked out.
 *
 * `percent_of_gross` is deliberately available only to deductions: an earning
 * defined as a share of the gross would be a share of itself.
 */
export type CalculationMethod = 'fixed' | 'percent_of_basic' | 'percent_of_gross';

export interface SalaryComponent {
  id: number;
  name: string;
  /** Short code on the payslip — `HRA`, `PT`. */
  code: string;
  type: ComponentType;
  calculation: CalculationMethod;
  /** Rupees for `fixed`, a percentage otherwise. */
  value: number;

  /**
   * Computed by statute, not by this school. PF, ESI and professional tax
   * are worked out by rule and cannot be edited per employee.
   */
  is_statutory: boolean;
  /** Earnings only — whether it enters taxable income. */
  is_taxable: boolean;
  /**
   * Whether this earning counts toward PF wages.
   *
   * Basic and dearness allowance do; HRA and conveyance do not. Getting this
   * wrong is the single most common way a PF return comes back rejected.
   */
  affects_pf: boolean;

  is_active: boolean;
  /** Position on the payslip, so it reads the same way every month. */
  sort_order: number;
  /** Structures currently using it — blocks deletion. */
  structures_count: number;
  created_at: string;
}

/** One component as it applies to one employee, at their own rate. */
export interface StructureLine {
  component_id: number;
  component_code: string;
  component_name: string;
  type: ComponentType;
  calculation: CalculationMethod;
  /** The rate or amount for this employee, which may differ from the default. */
  value: number;
  /** What that works out to at the current basic. Derived, never stored. */
  amount: number;
  is_statutory: boolean;
}

export interface SalaryStructure {
  id: number;
  employee_type: EmployeeType;
  employee_id: number;
  employee_name: string;
  /** Employee id for staff, the same for teachers — whatever the roster uses. */
  employee_code: string;
  designation: string;
  department: string | null;
  photo_url: string | null;

  basic: number;
  lines: StructureLine[];

  /** All derived from the basic and the lines. */
  gross: number;
  total_deductions: number;
  net: number;

  /** Statutory eligibility at this salary, worked out from the wage ceilings. */
  pf_applicable: boolean;
  esi_applicable: boolean;

  effective_from: string;
  is_active: boolean;
  updated_at: string;
}

/** Somebody on the roster who has no structure yet — the gap worth showing. */
export interface UnassignedEmployee {
  employee_type: EmployeeType;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  designation: string;
  photo_url: string | null;
}

// --- runs -------------------------------------------------------------------

/**
 * `draft` exists but has not been costed; `processed` has payslips and frozen
 * figures; `approved` has been signed off; `paid` has left the bank.
 *
 * The steps are separate because processing is arithmetic, approving is a
 * decision, and paying is an irreversible act — and schools routinely give
 * those three to three different people.
 */
export type RunStatus = 'draft' | 'processed' | 'approved' | 'paid';

export interface PayrollRun {
  id: number;
  /** `YYYY-MM`. A month is run once. */
  month: string;
  status: RunStatus;

  employees_count: number;
  gross_total: number;
  deductions_total: number;
  net_total: number;

  /** The four statutory totals a school actually files returns on. */
  pf_employee_total: number;
  pf_employer_total: number;
  esi_employee_total: number;
  esi_employer_total: number;

  processed_at: string | null;
  processed_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

/** `GET /payroll/runs/{id}` — adds the payslips. */
export interface PayrollRunDetail extends PayrollRun {
  payslips: Payslip[];
}

export interface PayslipLine {
  code: string;
  name: string;
  amount: number;
  is_statutory: boolean;
}

export interface Payslip {
  id: number;
  run_id: number;
  month: string;

  employee_type: EmployeeType;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  designation: string;
  department: string | null;
  photo_url: string | null;
  bank_account: string | null;
  pan: string | null;
  /** Universal Account Number, needed on every PF return. */
  uan: string | null;
  esi_number: string | null;

  /**
   * Attendance for the month, read from the attendance module rather than
   * recorded again. Loss of pay is what turns a standing salary into what
   * somebody is actually owed.
   */
  working_days: number;
  paid_days: number;
  lop_days: number;

  /** Pro-rated for loss of pay. The structure's basic is the full-month one. */
  basic: number;
  earnings: PayslipLine[];
  deductions: PayslipLine[];

  gross: number;
  total_deductions: number;
  net: number;

  /** Broken out because the returns need them separately from the totals. */
  pf_wages: number;
  pf_employee: number;
  pf_employer: number;
  eps_employer: number;
  esi_wages: number;
  esi_employee: number;
  esi_employer: number;

  /**
   * True once the run is processed.
   *
   * A payslip a school has handed out must not change because somebody edited
   * a salary structure afterwards — the same live-then-frozen split the exam
   * ranks and the library fines use.
   */
  is_frozen: boolean;
}

// --- statutory registers ----------------------------------------------------

/** One line of the monthly PF return. */
export interface PfRegisterRow {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  uan: string | null;
  pf_wages: number;
  employee_share: number;
  employer_share: number;
  pension_share: number;
  total: number;
}

/** One line of the monthly ESI return. */
export interface EsiRegisterRow {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  esi_number: string | null;
  esi_wages: number;
  employee_share: number;
  employer_share: number;
  total: number;
}

export interface StatutoryRegister {
  month: string;
  run_id: number | null;
  run_status: RunStatus | null;
  pf: {
    rows: PfRegisterRow[];
    wages: number;
    employee_total: number;
    employer_total: number;
    pension_total: number;
    grand_total: number;
  };
  esi: {
    rows: EsiRegisterRow[];
    wages: number;
    employee_total: number;
    employer_total: number;
    grand_total: number;
  };
}

export interface PayrollSummary {
  employees_on_payroll: number;
  employees_without_structure: number;
  monthly_gross: number;
  monthly_net: number;
  /** The month just gone, and whether it has been dealt with. */
  latest_run_month: string | null;
  latest_run_status: RunStatus | null;
  unpaid_runs: number;
}
