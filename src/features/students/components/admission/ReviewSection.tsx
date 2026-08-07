import { useFormContext } from 'react-hook-form';

import { Badge } from '@/components/ui/Badge';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { ageFrom, formatDate } from '@/lib/format';

import { RELATION_LABELS, STATUS_LABELS, STATUS_TONES } from '../../constants';
import type { StudentInput } from '../../schemas';

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right font-medium break-words text-slate-900">
        {value?.trim() ? value : <span className="font-normal text-slate-400">—</span>}
      </dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      <dl className="divide-y divide-slate-100">{children}</dl>
    </section>
  );
}

/**
 * Final confirmation before the record is created.
 *
 * Reads the live form values rather than a snapshot, so stepping back to fix
 * something and returning shows the correction.
 */
export function ReviewSection() {
  const { getValues } = useFormContext<StudentInput>();
  const values = getValues();
  const { classes } = useClassOptions(values.class_id);

  const klass = classes.find((entry) => entry.id === values.class_id);
  const section = klass?.sections.find((entry) => entry.id === values.section_id);

  const fullName = [values.first_name, values.middle_name, values.last_name]
    .filter(Boolean)
    .join(' ');

  const age = ageFrom(values.date_of_birth);
  const primary = values.guardians.find((guardian) => guardian.is_primary);
  const hasPreviousSchool = Boolean(values.previous_school.school_name?.trim());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-4 py-3">
        <div>
          <p className="text-base font-semibold text-slate-900">{fullName || 'Unnamed student'}</p>
          <p className="text-xs text-slate-500">
            {values.admission_no} · {klass?.name ?? 'No class'}
            {section ? ` — ${section.name}` : ''}
          </p>
        </div>
        <Badge tone={STATUS_TONES[values.status]}>{STATUS_LABELS[values.status]}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Personal">
          <Row label="Gender" value={values.gender} />
          <Row
            label="Date of birth"
            value={
              values.date_of_birth
                ? `${formatDate(values.date_of_birth)}${age !== null ? ` (${age} yrs)` : ''}`
                : ''
            }
          />
          <Row label="Blood group" value={values.blood_group} />
          <Row label="Category" value={values.category} />
          <Row label="Nationality" value={values.nationality} />
        </Block>

        <Block title="Enrolment">
          <Row label="Admission number" value={values.admission_no.toUpperCase()} />
          <Row label="Admission date" value={formatDate(values.admission_date)} />
          <Row label="Roll number" value={values.roll_no} />
          <Row label="Class" value={klass?.name} />
          <Row label="Section" value={section?.name} />
        </Block>

        <Block title="Address">
          <Row
            label="Address"
            value={[values.address.line1, values.address.line2].filter(Boolean).join(', ')}
          />
          <Row label="City" value={values.address.city} />
          <Row label="State" value={values.address.state} />
          <Row label="Postal code" value={values.address.postal_code} />
          <Row label="Country" value={values.address.country} />
        </Block>

        <Block title={`Guardians (${values.guardians.length})`}>
          {values.guardians.map((guardian, index) => (
            <Row
              key={index}
              label={`${RELATION_LABELS[guardian.relation]}${guardian.is_primary ? ' · primary' : ''}`}
              value={guardian.name ? `${guardian.name} — ${guardian.phone}` : ''}
            />
          ))}
          <Row label="First contact" value={primary?.phone} />
        </Block>

        <Block title="Medical">
          <Row label="Blood group" value={values.medical.blood_group} />
          <Row label="Allergies" value={values.medical.allergies} />
          <Row label="Chronic conditions" value={values.medical.chronic_conditions} />
          <Row
            label="Emergency contact"
            value={
              values.medical.emergency_contact_name
                ? `${values.medical.emergency_contact_name} — ${values.medical.emergency_contact_phone}`
                : ''
            }
          />
        </Block>

        <Block title="Previous school">
          {hasPreviousSchool ? (
            <>
              <Row label="School" value={values.previous_school.school_name} />
              <Row label="Board" value={values.previous_school.board} />
              <Row label="Last class" value={values.previous_school.last_class} />
              <Row label="Passing year" value={values.previous_school.passing_year} />
              <Row label="Percentage" value={values.previous_school.percentage} />
            </>
          ) : (
            <p className="py-1.5 text-sm text-slate-400">Not provided — entry-grade admission.</p>
          )}
        </Block>
      </div>
    </div>
  );
}
