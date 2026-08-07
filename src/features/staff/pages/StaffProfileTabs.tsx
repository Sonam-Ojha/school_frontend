import type { ReactNode } from 'react';

import { DocumentsCard } from '@/components/documents/DocumentsCard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { ageFrom, formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_OPTIONS,
  EMPLOYMENT_TYPE_LABELS,
  LICENCE_REQUIRED_TYPES,
  SHIFT_LABELS,
  STAFF_PERMISSIONS,
  STAFF_TYPE_LABELS,
  STATUS_LABELS,
} from '../constants';
import { staffDocumentKeys, staffKeys } from '../hooks/useStaff';
import { staffDocumentService } from '../services/staffService';

import { useStaffContext } from './staffContext';

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
  const member = useStaffContext();
  const age = ageFrom(member.date_of_birth);
  const showsLicence = LICENCE_REQUIRED_TYPES.includes(member.staff_type);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Personal">
        <Row label="Full name" value={member.full_name} />
        <Row label="Gender" value={<span className="capitalize">{member.gender}</span>} />
        <Row
          label="Date of birth"
          value={`${formatDate(member.date_of_birth)}${age !== null ? ` · ${age} years` : ''}`}
        />
        <Row label="Blood group" value={member.blood_group} />
        <Row
          label="Marital status"
          value={member.marital_status ? <span className="capitalize">{member.marital_status}</span> : null}
        />
        <Row label="Nationality" value={member.nationality} />
        <Row
          label="Aadhaar"
          // Masked: the full number is not needed to confirm identity here.
          value={member.aadhaar_no ? `XXXX XXXX ${member.aadhaar_no.slice(-4)}` : null}
        />
        <Row label="PAN" value={member.pan_no} />
      </Section>

      <Section title="Employment">
        <Row label="Employee ID" value={<code className="text-xs">{member.employee_id}</code>} />
        <Row label="Staff type" value={STAFF_TYPE_LABELS[member.staff_type]} />
        <Row label="Designation" value={member.designation} />
        <Row label="Joining date" value={formatDate(member.joining_date)} />
        <Row label="Employment type" value={EMPLOYMENT_TYPE_LABELS[member.employment_type]} />
        <Row label="Shift" value={SHIFT_LABELS[member.shift]} />
        <Row label="Status" value={STATUS_LABELS[member.status]} />
        <Row label="Reports to" value={member.reports_to} />
      </Section>

      {showsLicence && (
        <Section title="Driving licence">
          <Row label="Licence number" value={member.licence_number} />
          <Row label="Valid until" value={member.licence_expiry ? formatDate(member.licence_expiry) : null} />
        </Section>
      )}

      <Section title="Contact">
        <Row
          label="Email"
          value={
            <a href={`mailto:${member.email}`} className="text-brand-600 hover:underline">
              {member.email}
            </a>
          }
        />
        <Row
          label="Phone"
          value={
            <a href={`tel:${member.phone}`} className="text-brand-600 hover:underline">
              {member.phone}
            </a>
          }
        />
        <Row label="Alternate phone" value={member.alternate_phone} />
        <Row label="Emergency contact" value={member.emergency_contact_name} />
        <Row label="Emergency phone" value={member.emergency_contact_phone} />
      </Section>

      <Section title="Address">
        <Row
          label="Address"
          value={[member.address.line1, member.address.line2].filter(Boolean).join(', ')}
        />
        <Row label="City" value={member.address.city} />
        <Row label="State" value={member.address.state} />
        <Row label="Postal code" value={member.address.postal_code} />
        <Row label="Country" value={member.address.country} />
      </Section>

      <Section title="Notes">
        <Row label="Notes" value={member.notes} />
      </Section>
    </div>
  );
}

export function DocumentsTab() {
  const member = useStaffContext();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  return (
    <DocumentsCard
      service={staffDocumentService}
      ownerId={member.id}
      listKey={staffDocumentKeys(member.id)}
      ownerKey={staffKeys.detail(member.id)}
      typeOptions={DOCUMENT_TYPE_OPTIONS}
      typeLabels={DOCUMENT_TYPE_LABELS}
      canUpdate={hasPermission(STAFF_PERMISSIONS.update)}
      canDelete={hasPermission(STAFF_PERMISSIONS.delete)}
      description="Appointment letters, ID proofs and verification documents."
    />
  );
}
