import { fromMinor, toMinor } from '@/lib/money';


/**
 * Provident Fund and Employees' State Insurance.
 *
 * The two statutory deductions every Indian school withholds, worked out
 * here rather than typed in per employee — they are set by statute, not by
 * the school, and a rate somebody can edit is a rate that will be edited
 * wrong. Kept as pure functions so the screen previewing a salary and the
 * server processing the run cannot disagree about what a payslip says.
 *
 * All arithmetic goes through `lib/money` in paise. A payroll that is a
 * paisa out is a payroll a return gets rejected on.
 */

// --- Provident Fund ---------------------------------------------------------

/** Employees' Provident Funds and Miscellaneous Provisions Act, 1952. */
export const PF_RATE_EMPLOYEE = 12;
export const PF_RATE_EMPLOYER = 12;

/**
 * The employer's 12% splits: 8.33% to the pension scheme, the rest to PF.
 *
 * The pension share is calculated on wages capped at the ceiling even when
 * the employer contributes on more — which is why it is not simply 8.33% of
 * whatever the employer paid.
 */
export const EPS_RATE = 8.33;

/**
 * Statutory PF wage ceiling.
 *
 * Contribution is compulsory up to this; above it a member may be excluded,
 * or the employer may contribute on the full wage voluntarily. Both are
 * ordinary, so the caller says which.
 */
export const PF_WAGE_CEILING = 15_000;

export interface PfOptions {
  /**
   * Contribute on the whole wage rather than the ceiling. Some schools do;
   * it is a decision, not a default.
   */
  contributeOnFullWage?: boolean;
  /** A member who has opted out, which only the over-ceiling may do. */
  isExcluded?: boolean;
}

export interface PfContribution {
  /** The wage the contribution was actually computed on. */
  wages: number;
  employee: number;
  /** The employer's total — the pension and PF shares added back together. */
  employer: number;
  /** The pension slice of the employer's share. */
  pension: number;
  /** The employer's share net of the pension slice. */
  provident: number;
  applicable: boolean;
}

/**
 * PF on one month's PF wages.
 *
 * PF wages are basic plus dearness allowance, not the gross — house rent and
 * conveyance are excluded by the Act, which is the single most common reason
 * a return comes back rejected.
 */
export function pfFor(pfWages: number, options: PfOptions = {}): PfContribution {
  const { contributeOnFullWage = false, isExcluded = false } = options;

  if (isExcluded || pfWages <= 0) {
    return { wages: 0, employee: 0, employer: 0, pension: 0, provident: 0, applicable: false };
  }

  const contributory = contributeOnFullWage ? pfWages : Math.min(pfWages, PF_WAGE_CEILING);

  /**
   * Rounded to the rupee, not the paisa.
   *
   * EPFO rounds every contribution to the nearest rupee, and a return filed
   * in paise is a return that is rejected. It is also the only way the
   * published figures come out: 8.33% of the ₹15,000 ceiling is ₹1,249.50,
   * and the statutory maximum pension contribution everybody quotes is
   * ₹1,250 — which then splits ₹1,800 into ₹550 PF and ₹1,250 pension
   * exactly, as the EPFO's own tables do.
   */
  const employee = Math.round((contributory * PF_RATE_EMPLOYEE) / 100);
  const employer = Math.round((contributory * PF_RATE_EMPLOYER) / 100);

  // The pension share never rises above the ceiling, whatever the employer
  // contributes on — that is the rule the cap exists for.
  const pensionable = Math.min(contributory, PF_WAGE_CEILING);
  const pension = Math.round((pensionable * EPS_RATE) / 100);

  return {
    wages: contributory,
    employee,
    employer,
    pension,
    // Derived by subtraction so the two shares always add back to the total.
    provident: employer - pension,
    applicable: true,
  };
}

// --- Employees' State Insurance ---------------------------------------------

/** Employees' State Insurance Act, 1948, at the rates in force since 2019. */
export const ESI_RATE_EMPLOYEE = 0.75;
export const ESI_RATE_EMPLOYER = 3.25;

/** Above this monthly gross an employee is outside the scheme entirely. */
export const ESI_WAGE_CEILING = 21_000;

export interface EsiContribution {
  wages: number;
  employee: number;
  employer: number;
  applicable: boolean;
}

/**
 * ESI on one month's gross.
 *
 * Unlike PF there is no contribution above the ceiling — an employee earning
 * more than it is simply out of the scheme, rather than contributing on a
 * capped wage. Conflating the two ceilings is the other common return error.
 *
 * Employee shares are rounded up to the rupee and employer shares down, as
 * the Act directs.
 */
export function esiFor(gross: number, options: { isEligible?: boolean } = {}): EsiContribution {
  const { isEligible = true } = options;

  if (!isEligible || gross <= 0 || gross > ESI_WAGE_CEILING) {
    return { wages: 0, employee: 0, employer: 0, applicable: false };
  }

  return {
    wages: gross,
    employee: Math.ceil((gross * ESI_RATE_EMPLOYEE) / 100),
    employer: Math.floor((gross * ESI_RATE_EMPLOYER) / 100),
    applicable: true,
  };
}

// --- eligibility ------------------------------------------------------------

/**
 * Whether a salary falls inside each scheme.
 *
 * Read by the structure screen so somebody setting a basic can see, before
 * saving, which statutory lines the employee will attract.
 */
export function statutoryEligibility(pfWages: number, gross: number) {
  return {
    pf_applicable: pfWages > 0,
    /** Contribution is compulsory only up to the ceiling. */
    pf_compulsory: pfWages > 0 && pfWages <= PF_WAGE_CEILING,
    esi_applicable: gross > 0 && gross <= ESI_WAGE_CEILING,
  };
}

/**
 * Pro-rate a monthly amount for days actually paid.
 *
 * Loss of pay is applied to the whole salary, not only the basic — a month
 * with five unpaid days is five days without house rent allowance too.
 */
export function proRate(amount: number, paidDays: number, workingDays: number): number {
  if (workingDays <= 0) return 0;
  if (paidDays >= workingDays) return amount;
  if (paidDays <= 0) return 0;

  return fromMinor(Math.round((toMinor(amount) * paidDays) / workingDays));
}
