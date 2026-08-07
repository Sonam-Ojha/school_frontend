import { BookOpen, Briefcase, GraduationCap } from 'lucide-react';
import type { ReactNode } from 'react';

import { DocumentsCard } from '@/components/documents/DocumentsCard';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { ageFrom, formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_OPTIONS,
  EMPLOYMENT_TYPE_LABELS,
  TEACHER_PERMISSIONS,
} from '../constants';
import { teacherDocumentKeys, teacherKeys } from '../hooks/useTeachers';
import { teacherDocumentService } from '../services/teacherService';

import { useTeacherContext } from './teacherContext';

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
  const teacher = useTeacherContext();
  const age = ageFrom(teacher.date_of_birth);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Personal">
        <Row label="Full name" value={teacher.full_name} />
        <Row label="Gender" value={<span className="capitalize">{teacher.gender}</span>} />
        <Row
          label="Date of birth"
          value={`${formatDate(teacher.date_of_birth)}${age !== null ? ` · ${age} years` : ''}`}
        />
        <Row label="Blood group" value={teacher.blood_group} />
        <Row
          label="Marital status"
          value={teacher.marital_status ? <span className="capitalize">{teacher.marital_status}</span> : null}
        />
        <Row label="Nationality" value={teacher.nationality} />
        <Row
          label="Aadhaar"
          // Masked: the full number is not needed to confirm identity here.
          value={teacher.aadhaar_no ? `XXXX XXXX ${teacher.aadhaar_no.slice(-4)}` : null}
        />
        <Row label="PAN" value={teacher.pan_no} />
      </Section>

      <Section title="Employment">
        <Row label="Employee ID" value={<code className="text-xs">{teacher.employee_id}</code>} />
        <Row label="Designation" value={teacher.designation} />
        <Row label="Department" value={teacher.department} />
        <Row label="Joining date" value={formatDate(teacher.joining_date)} />
        <Row label="Employment type" value={EMPLOYMENT_TYPE_LABELS[teacher.employment_type]} />
        <Row label="Status" value={<span className="capitalize">{teacher.status.replace('_', ' ')}</span>} />
        <Row label="Highest qualification" value={teacher.highest_qualification} />
        <Row
          label="Total experience"
          value={teacher.experience_years > 0 ? `${teacher.experience_years} years` : 'Fresher'}
        />
      </Section>

      <Section title="Contact">
        <Row
          label="Email"
          value={
            <a href={`mailto:${teacher.email}`} className="text-brand-600 hover:underline">
              {teacher.email}
            </a>
          }
        />
        <Row
          label="Phone"
          value={
            <a href={`tel:${teacher.phone}`} className="text-brand-600 hover:underline">
              {teacher.phone}
            </a>
          }
        />
        <Row label="Alternate phone" value={teacher.alternate_phone} />
        <Row label="Emergency contact" value={teacher.emergency_contact_name} />
        <Row label="Emergency phone" value={teacher.emergency_contact_phone} />
      </Section>

      <Section title="Address">
        <Row
          label="Address"
          value={[teacher.address.line1, teacher.address.line2].filter(Boolean).join(', ')}
        />
        <Row label="City" value={teacher.address.city} />
        <Row label="State" value={teacher.address.state} />
        <Row label="Postal code" value={teacher.address.postal_code} />
        <Row label="Country" value={teacher.address.country} />
      </Section>
    </div>
  );
}

export function QualificationsTab() {
  const teacher = useTeacherContext();

  if (teacher.qualifications.length === 0) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<GraduationCap className="size-6" />}
            title="No qualifications recorded"
            description="Add at least one degree or certification to this record."
          />
        </CardBody>
      </Card>
    );
  }

  // Most recent first — the qualification that matters is usually the latest.
  const sorted = [...teacher.qualifications].sort(
    (a, b) => b.year_of_passing - a.year_of_passing,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {sorted.map((qualification) => (
        <Card key={qualification.id}>
          <CardHeader
            title={
              <span className="flex flex-wrap items-center gap-2">
                {qualification.degree}
                {qualification.specialization && (
                  <Badge tone="info">{qualification.specialization}</Badge>
                )}
              </span>
            }
            description={String(qualification.year_of_passing)}
          />
          <CardBody>
            <dl className="divide-y divide-slate-100">
              <Row label="Institution" value={qualification.institution} />
              <Row label="Board / University" value={qualification.board_university} />
              <Row label="Grade" value={qualification.grade} />
            </dl>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export function ExperienceTab() {
  const teacher = useTeacherContext();

  if (teacher.experiences.length === 0) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<Briefcase className="size-6" />}
            title="No prior experience recorded"
            description="Expected for a first appointment."
          />
        </CardBody>
      </Card>
    );
  }

  // Newest first, with any current role at the top.
  const sorted = [...teacher.experiences].sort(
    (a, b) => new Date(b.from_date).getTime() - new Date(a.from_date).getTime(),
  );

  return (
    <div className="space-y-4">
      {sorted.map((experience) => (
        <Card key={experience.id}>
          <CardHeader
            title={
              <span className="flex flex-wrap items-center gap-2">
                {experience.designation}
                {experience.is_current && (
                  <Badge tone="success" withDot>
                    Current
                  </Badge>
                )}
              </span>
            }
            description={experience.organisation}
          />
          <CardBody>
            <dl className="divide-y divide-slate-100">
              <Row
                label="Period"
                value={`${formatDate(experience.from_date)} — ${
                  experience.is_current ? 'Present' : formatDate(experience.to_date)
                }`}
              />
              <Row label="Responsibilities" value={experience.responsibilities} />
            </dl>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export function AssignmentsTab() {
  const teacher = useTeacherContext();

  const hasNothing = teacher.subjects.length === 0 && teacher.class_assignments.length === 0;

  if (hasNothing) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<BookOpen className="size-6" />}
            title="No subjects or classes assigned"
            description="Assign subjects and classes so this teacher appears in the timetable."
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader
          title="Subjects"
          description={`${teacher.subjects.length} subject${teacher.subjects.length === 1 ? '' : 's'}`}
        />
        <CardBody>
          {teacher.subjects.length === 0 ? (
            <p className="text-sm text-slate-400">No subjects assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map((subject) => (
                <Badge key={subject.id} tone="info">
                  {subject.name} ({subject.code})
                </Badge>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Classes"
          description={`${teacher.class_assignments.length} assignment${
            teacher.class_assignments.length === 1 ? '' : 's'
          }`}
        />
        <CardBody className="p-0">
          {teacher.class_assignments.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-400 sm:px-6">No classes assigned.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {teacher.class_assignments.map((assignment) => (
                <li
                  key={`${assignment.class_id}-${assignment.section_id ?? 'all'}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
                >
                  <span className="text-sm text-slate-800">
                    {assignment.class_name}
                    {/* No section means every section of that class. */}
                    {assignment.section_name ? ` — ${assignment.section_name}` : ' — all sections'}
                  </span>

                  {assignment.is_class_teacher && <Badge tone="info">Class teacher</Badge>}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export function DocumentsTab() {
  const teacher = useTeacherContext();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  return (
    <DocumentsCard
      service={teacherDocumentService}
      ownerId={teacher.id}
      listKey={teacherDocumentKeys(teacher.id)}
      ownerKey={teacherKeys.detail(teacher.id)}
      typeOptions={DOCUMENT_TYPE_OPTIONS}
      typeLabels={DOCUMENT_TYPE_LABELS}
      canUpdate={hasPermission(TEACHER_PERMISSIONS.update)}
      canDelete={hasPermission(TEACHER_PERMISSIONS.delete)}
      description="Certificates, appointment letters and verification documents."
    />
  );
}
