/**
 * Money arithmetic in minor units.
 *
 * Every sum, split and allocation in the fee module goes through here.
 * Floating-point rupees do not add up — `0.1 + 0.2 !== 0.3` — and a fee
 * ledger that is a paisa out is a ledger nobody trusts. Amounts cross the
 * wire as decimal numbers (what Laravel casts a `decimal` column to) and are
 * converted to integer paise the moment they are used in a calculation.
 */

/** Rupees (or any major unit) → integer minor units. */
export function toMinor(amount: number): number {
  return Math.round(amount * 100);
}

/** Integer minor units → major units, to two places. */
export function fromMinor(minor: number): number {
  return Math.round(minor) / 100;
}

/** Sum major-unit amounts without accumulating float error. */
export function sumAmounts(amounts: number[]): number {
  return fromMinor(amounts.reduce((total, amount) => total + toMinor(amount), 0));
}

/** `a - b`, exact. */
export function subtractAmounts(a: number, b: number): number {
  return fromMinor(toMinor(a) - toMinor(b));
}

/**
 * A percentage of an amount, rounded to the nearest paisa.
 *
 * Rounding happens once, at the end — computing 7.5% of each of ten items and
 * summing gives a different answer from taking 7.5% of the total, and the
 * total is the one a parent checks.
 */
export function percentageOf(amount: number, percent: number): number {
  return fromMinor(Math.round((toMinor(amount) * percent) / 100));
}

export interface Allocatable {
  id: number;
  /** What is still owed on this line, in major units. */
  balance: number;
}

export interface Allocation {
  id: number;
  amount: number;
}

/**
 * Spread a payment across outstanding lines, oldest first.
 *
 * Callers pass the lines already in the order they should be settled — due
 * date ascending — because "oldest first" is a business rule about which debt
 * clears, not a property of the numbers.
 *
 * Returns the allocations plus anything left over, which the caller must
 * handle rather than silently absorb.
 */
export function allocateAcross(
  amount: number,
  lines: Allocatable[],
): { allocations: Allocation[]; unallocated: number } {
  let remaining = toMinor(amount);
  const allocations: Allocation[] = [];

  for (const line of lines) {
    if (remaining <= 0) break;

    const owed = toMinor(line.balance);
    if (owed <= 0) continue;

    const applied = Math.min(remaining, owed);
    allocations.push({ id: line.id, amount: fromMinor(applied) });
    remaining -= applied;
  }

  return { allocations, unallocated: fromMinor(remaining) };
}

/**
 * Split a total into `count` equal parts that sum back to it exactly.
 *
 * The remainder lands on the first instalments rather than being dropped —
 * ₹1000 over 3 becomes 333.34 + 333.33 + 333.33, not three parts that lose a
 * paisa between them.
 */
export function splitEvenly(total: number, count: number): number[] {
  if (count <= 0) return [];

  const totalMinor = toMinor(total);
  const base = Math.floor(totalMinor / count);
  const remainder = totalMinor - base * count;

  return Array.from({ length: count }, (_, index) =>
    fromMinor(base + (index < remainder ? 1 : 0)),
  );
}

/** True when two major-unit amounts are equal to the paisa. */
export function amountsEqual(a: number, b: number): boolean {
  return toMinor(a) === toMinor(b);
}
