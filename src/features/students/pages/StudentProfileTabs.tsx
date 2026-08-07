import { HeartPulse, Phone, School, Star, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { ageFrom, formatCurrency, formatDate } from '@/lib/format';

import { DocumentsCard } from '@/components/documents/DocumentsCard';
import { useAuthStore } from '@/store/authStore';

import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_OPTIONS, RELATION_LABELS, STUDENT_PERMISSIONS } from '../constants';
import { studentDocumentKeys, studentKeys } from '../hooks/useStudents';
import { studentDocumentService } from '../services/studentDocumentService';

import { useStudentContext } from './studentContext';

/** Definition row. Empty values read as "not recorded", never as a blank gap. */
function Row({ label, value }: { label: string; value: ReactNode }) {
  const isEmpty =
    value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

  return (
    <div className="grid grid-cols-3 gap-4 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn('col-span-2 min-w-0 break-words', isEmpty ? 'text-slate-400' : 'text-slate-900')}>
        {isEmpty ? 'Not recorded' : value}
      </dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody>
        <dl className="divide-y divide-slate-100">{children}</dl>
      </CardBody>
    </Card>
  );
}

export function OverviewTab() {
  const student = useStudentContext();
  const age = ageFrom(student.date_of_birth);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Personal">
        <Row label="Full name" value={student.full_name} />
        <Row label="Gender" value={<span className="capitalize">{student.gender}</span>} />
        <Row
          label="Date of birth"
          value={`${formatDate(student.date_of_birth)}${age !== null ? ` · ${age} years` : ''}`}
        />
        <Row label="Blood group" value={student.blood_group} />
        <Row label="Category" value={student.category} />
        <Row label="Religion" value={student.religion} />
        <Row label="Nationality" value={student.nationality} />
        <Row label="Mother tongue" value={student.mother_tongue} />
        <Row
          label="Aadhaar"
          // Masked: the full number is not needed to confirm identity here.
          value={student.aadhaar_no ? `XXXX XXXX ${student.aadhaar_no.slice(-4)}` : null}
        />
      </Section>

      <Section title="Enrolment">
        <Row label="Admission number" value={<code className="text-xs">{student.admission_no}</code>} />
        <Row label="Admission date" value={formatDate(student.admission_date)} />
        <Row label="Academic session" value={student.academic_year_name} />
        <Row label="Class" value={student.class_name} />
        <Row label="Section" value={student.section_name} />
        <Row label="Roll number" value={student.roll_no} />
        <Row label="Status" value={<span className="capitalize">{student.status}</span>} />
      </Section>

      <Section title="Contact">
        <Row label="Email" value={student.email} />
        <Row label="Phone" value={student.phone} />
      </Section>

      <Section title="Address">
        <Row label="Address" value={[student.address.line1, student.address.line2].filter(Boolean).join(', ')} />
        <Row label="City" value={student.address.city} />
        <Row label="State" value={student.address.state} />
        <Row label="Postal code" value={student.address.postal_code} />
        <Row label="Country" value={student.address.country} />
      </Section>
    </div>
  );
}

export function GuardiansTab() {
  const student = useStudentContext();

  if (student.guardians.length === 0) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<Phone className="size-6" />}
            title="No guardians recorded"
            description="Add a parent or guardian so the school has someone to contact."
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {student.guardians.map((guardian) => (
        <Card key={guardian.id} className={cn(guardian.is_primary && 'ring-1 ring-brand-300')}>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                {guardian.name}
                {guardian.is_primary && (
                  <Badge tone="info" className="gap-1">
                    <Star className="size-3" aria-hidden />
                    Primary
                  </Badge>
                )}
              </span>
            }
            description={RELATION_LABELS[guardian.relation]}
          />
          <CardBody>
            <dl className="divide-y divide-slate-100">
              <Row
                label="Phone"
                value={
                  <a href={`tel:${guardian.phone}`} className="text-brand-600 hover:underline">
                    {guardian.phone}
                  </a>
                }
              />
              <Row
                label="Email"
                value={
                  guardian.email ? (
                    <a href={`mailto:${guardian.email}`} className="text-brand-600 hover:underline">
                      {guardian.email}
                    </a>
                  ) : null
                }
              />
              <Row label="Occupation" value={guardian.occupation} />
              <Row
                label="Annual income"
                value={guardian.annual_income ? formatCurrency(guardian.annual_income) : null}
              />
            </dl>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export function MedicalTab() {
  const student = useStudentContext();
  const { medical } = student;

  const hasAny = Object.values(medical).some((value) => value !== null && value !== '');

  // Allergies are the one field staff need at a glance in an emergency.
  const hasAlerts = Boolean(medical.allergies || medical.chronic_conditions);

  return (
    <div className="space-y-6">
      {!hasAny && (
        <Alert tone="warning" title="No medical information on file">
          Ask the guardian to complete the medical section — staff have nothing to work from in an
          emergency.
        </Alert>
      )}

      {hasAlerts && (
        <Alert tone="danger" title="Medical alerts">
          <ul className="list-inside list-disc space-y-0.5">
            {medical.allergies && <li>Allergies: {medical.allergies}</li>}
            {medical.chronic_conditions && <li>Conditions: {medical.chronic_conditions}</li>}
          </ul>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Emergency contact">
          <Row label="Name" value={medical.emergency_contact_name} />
          <Row
            label="Phone"
            value={
              medical.emergency_contact_phone ? (
                <a
                  href={`tel:${medical.emergency_contact_phone}`}
                  className="text-brand-600 hover:underline"
                >
                  {medical.emergency_contact_phone}
                </a>
              ) : null
            }
          />
        </Section>

        <Section title="Health">
          <Row label="Blood group" value={medical.blood_group ?? student.blood_group} />
          <Row label="Height" value={medical.height_cm ? `${medical.height_cm} cm` : null} />
          <Row label="Weight" value={medical.weight_kg ? `${medical.weight_kg} kg` : null} />
          <Row label="Allergies" value={medical.allergies} />
          <Row label="Chronic conditions" value={medical.chronic_conditions} />
          <Row label="Regular medication" value={medical.medications} />
        </Section>

        <Section title="Family doctor">
          <Row label="Name" value={medical.doctor_name} />
          <Row label="Phone" value={medical.doctor_phone} />
        </Section>

        <Section title="Notes">
          <Row
            label="Additional notes"
            value={medical.notes ?? <span className="flex items-center gap-1.5">
              <HeartPulse className="size-3.5" aria-hidden /> None
            </span>}
          />
        </Section>
      </div>
    </div>
  );
}

export function PreviousSchoolTab() {
  const student = useStudentContext();
  const previous = student.previous_school;

  if (!previous.school_name) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<School className="size-6" />}
            title="No previous school recorded"
            description="Expected for students who joined at the entry grade."
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Previous school">
        <Row label="School name" value={previous.school_name} />
        <Row label="Board" value={previous.board} />
        <Row label="Last class attended" value={previous.last_class} />
        <Row label="Year of passing" value={previous.passing_year} />
        <Row
          label="Percentage"
          value={previous.percentage !== null ? `${previous.percentage}%` : null}
        />
      </Section>

      <Section title="Transfer">
        <Row label="Certificate number" value={previous.tc_number} />
        <Row label="Reason for leaving" value={previous.reason_for_leaving} />
        <Row
          label="Certificate on file"
          value={
            student.documents_count > 0 ? (
              'Check the Documents tab'
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700">
                <TriangleAlert className="size-3.5" aria-hidden />
                No documents uploaded
              </span>
            )
          }
        />
      </Section>
    </div>
  );
}

export function DocumentsTab() {
  const student = useStudentContext();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  return (
    <DocumentsCard
      service={studentDocumentService}
      ownerId={student.id}
      listKey={studentDocumentKeys(student.id)}
      ownerKey={studentKeys.detail(student.id)}
      typeOptions={DOCUMENT_TYPE_OPTIONS}
      typeLabels={DOCUMENT_TYPE_LABELS}
      canUpdate={hasPermission(STUDENT_PERMISSIONS.update)}
      canDelete={hasPermission(STUDENT_PERMISSIONS.delete)}
      description="Certificates, marksheets and ID proofs held on file."
    />
  );
}
