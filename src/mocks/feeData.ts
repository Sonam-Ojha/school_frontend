import type { Discount, FeeStructureDetail, FeeType } from '@/features/fees/types';

import { classes } from './academicsData';

/**
 * Fee seed for the development mock.
 *
 * Structures are anchored to the current year so due dates straddle today —
 * a fixed year would leave every instalment either long overdue or far in the
 * future, and neither shows the collection screen honestly.
 */

const YEAR = new Date().getFullYear();
const iso = (month: number, day: number) =>
  `${YEAR}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const feeTypes: FeeType[] = [
  { id: 1, name: 'Tuition fee', code: 'TUI', category: 'tuition', is_recurring: true, is_refundable: false, is_active: true, description: 'Core academic fee.', structures_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  { id: 2, name: 'Admission fee', code: 'ADM', category: 'admission', is_recurring: false, is_refundable: false, is_active: true, description: 'Charged once, at admission.', structures_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  { id: 3, name: 'Transport fee', code: 'TRP', category: 'transport', is_recurring: true, is_refundable: false, is_active: true, description: null, structures_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  { id: 4, name: 'Examination fee', code: 'EXM', category: 'examination', is_recurring: true, is_refundable: false, is_active: true, description: null, structures_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  { id: 5, name: 'Library fee', code: 'LIB', category: 'library', is_recurring: true, is_refundable: false, is_active: true, description: null, structures_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  { id: 6, name: 'Laboratory fee', code: 'LAB', category: 'laboratory', is_recurring: true, is_refundable: false, is_active: true, description: 'Senior classes only.', structures_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  // The head the hostel module raises rent and mess against. Boarders only,
  // so it is not on any class structure — the charge comes from the bed.
  { id: 9, name: 'Hostel fee', code: 'HOS', category: 'hostel', is_recurring: true, is_refundable: false, is_active: true, description: 'Room rent and mess, raised monthly from the hostel module.', structures_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  { id: 7, name: 'Caution deposit', code: 'CAU', category: 'other', is_recurring: false, is_refundable: true, is_active: true, description: 'Returned when the student leaves.', structures_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  // Retired, kept so historical structures still resolve their lines.
  { id: 8, name: 'Smart class fee', code: 'SMC', category: 'activity', is_recurring: true, is_refundable: false, is_active: false, description: 'Discontinued from this session.', structures_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
];

export const discounts: Discount[] = [
  { id: 1, name: 'Sibling concession', code: 'SIB', value_type: 'percentage', value: 10, description: 'Second and subsequent children.', is_active: true, usages_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  { id: 2, name: 'Staff ward', code: 'STF', value_type: 'percentage', value: 50, description: 'Children of employees.', is_active: true, usages_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  { id: 3, name: 'Merit scholarship', code: 'MER', value_type: 'percentage', value: 25, description: 'Top three in the previous year.', is_active: true, usages_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  { id: 4, name: 'Early payment', code: 'EARLY', value_type: 'fixed', value: 1000, description: 'Full year paid before the first due date.', is_active: true, usages_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
  { id: 5, name: 'Hardship waiver', code: 'HARD', value_type: 'percentage', value: 100, description: 'Case-by-case, principal approval required.', is_active: false, usages_count: 0, created_at: `${YEAR}-01-01T00:00:00.000000Z` },
];

interface StructureSeed {
  id: number;
  classId: number;
  /** [feeTypeId, amount] per line. */
  lines: [number, number][];
}

/** Senior classes carry a lab fee; juniors do not. */
const STRUCTURE_SEED: StructureSeed[] = [
  { id: 1, classId: 1, lines: [[1, 24000], [3, 9000], [4, 1500], [5, 600]] },
  { id: 2, classId: 2, lines: [[1, 26000], [3, 9000], [4, 1500], [5, 600]] },
  { id: 3, classId: 3, lines: [[1, 32000], [3, 10000], [4, 2000], [5, 800]] },
  { id: 4, classId: 4, lines: [[1, 38000], [3, 10000], [4, 2500], [5, 800], [6, 3000]] },
  { id: 5, classId: 5, lines: [[1, 45000], [3, 12000], [4, 3000], [5, 1000], [6, 4000]] },
  { id: 6, classId: 6, lines: [[1, 52000], [3, 12000], [4, 3500], [5, 1000], [6, 5000]] },
];

/** Three terms, the first already past so the collection screen has overdues. */
const INSTALMENT_PLAN: { name: string; month: number; day: number }[] = [
  { name: 'Term 1', month: 4, day: 15 },
  { name: 'Term 2', month: 8, day: 15 },
  { name: 'Term 3', month: 12, day: 15 },
];

function buildStructure(seed: StructureSeed): FeeStructureDetail {
  const klass = classes.find((entry) => entry.id === seed.classId);
  const section = null;

  const items = seed.lines.map(([feeTypeId, amount], index) => {
    const feeType = feeTypes.find((entry) => entry.id === feeTypeId)!;
    return {
      id: seed.id * 100 + index,
      fee_type_id: feeTypeId,
      fee_type_name: feeType.name,
      fee_type_code: feeType.code,
      amount,
      frequency: feeType.is_recurring ? ('annual' as const) : ('one_time' as const),
    };
  });

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  // Split in paise so the parts add back to the total exactly.
  const totalMinor = Math.round(total * 100);
  const base = Math.floor(totalMinor / INSTALMENT_PLAN.length);
  const remainder = totalMinor - base * INSTALMENT_PLAN.length;

  const installments = INSTALMENT_PLAN.map((plan, index) => ({
    id: seed.id * 100 + 50 + index,
    sequence: index + 1,
    name: plan.name,
    due_date: iso(plan.month, plan.day),
    amount: (base + (index < remainder ? 1 : 0)) / 100,
  }));

  return {
    id: seed.id,
    name: `${klass?.name ?? 'Class'} — ${YEAR}-${YEAR + 1}`,
    academic_year_id: 3,
    academic_year_name: `${YEAR}-${YEAR + 1}`,
    class_id: seed.classId,
    class_name: klass?.name ?? 'Class',
    section_id: section,
    section_name: null,
    is_active: true,
    total_amount: total,
    items_count: items.length,
    installments_count: installments.length,
    students_count: 0,
    created_at: `${YEAR}-03-01T00:00:00.000000Z`,
    updated_at: `${YEAR}-03-01T00:00:00.000000Z`,
    items,
    installments,
  };
}

export const feeStructures: FeeStructureDetail[] = STRUCTURE_SEED.map(buildStructure);
