import { GraduationCap } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/format';
import type { SchoolSettings } from '@/features/settings/types';

import type { StudentDetail } from '../types';

interface StudentIdCardProps {
  student: StudentDetail;
  school: SchoolSettings | undefined;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-semibold tracking-wider text-slate-400 uppercase">{label}</p>
      <p className="truncate text-[11px] font-medium text-slate-900">{value?.trim() || '—'}</p>
    </div>
  );
}

/**
 * Printable student ID card, front and back.
 *
 * Sized to CR80 (85.6 × 54 mm) in millimetres rather than pixels, so what
 * prints is the physical card size regardless of screen DPI. `print-exact`
 * keeps the background colours, without which the card is unusable.
 */
export function StudentIdCard({ student, school }: StudentIdCardProps) {
  const primary = student.guardians.find((guardian) => guardian.is_primary);

  return (
    <div className="print-exact flex flex-wrap gap-6">
      {/* Front */}
      <div
        className="flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-card"
        style={{ width: '85.6mm', height: '54mm' }}
      >
        <div className="flex items-center gap-2 bg-brand-700 px-3 py-2 text-white">
          <span className="flex size-6 shrink-0 items-center justify-center rounded bg-white/20">
            {school?.logo_url ? (
              <img src={school.logo_url} alt="" className="size-4 object-contain" />
            ) : (
              <GraduationCap className="size-3.5" aria-hidden />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] leading-tight font-bold">
              {school?.profile.name ?? 'School'}
            </p>
            <p className="truncate text-[7px] leading-tight text-white/80">
              {school ? `${school.address.city}, ${school.address.state}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-1 gap-3 px-3 py-2">
          <div className="shrink-0">
            <Avatar name={student.full_name} src={student.photo_url} size="lg" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="min-w-0">
              <p className="truncate text-[13px] leading-tight font-bold text-slate-900">
                {student.full_name}
              </p>
              <p className="text-[9px] text-slate-500">
                {student.class_name}
                {student.section_name ? ` — ${student.section_name}` : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <Field label="Adm no." value={student.admission_no} />
              <Field label="Roll no." value={student.roll_no} />
              <Field label="DOB" value={formatDate(student.date_of_birth)} />
              <Field label="Blood" value={student.blood_group} />
            </div>
          </div>
        </div>

        <div className="bg-slate-100 px-3 py-1">
          <p className="truncate text-[7px] text-slate-500">
            Session {student.academic_year_name} · Valid while enrolled
          </p>
        </div>
      </div>

      {/* Back */}
      <div
        className="flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-card"
        style={{ width: '85.6mm', height: '54mm' }}
      >
        <div className="bg-slate-100 px-3 py-1.5">
          <p className="text-[9px] font-semibold text-slate-700">Emergency & contact details</p>
        </div>

        <div className="flex-1 space-y-1.5 px-3 py-2">
          <Field label="Guardian" value={primary ? `${primary.name} (${primary.relation})` : null} />
          <Field label="Guardian phone" value={primary?.phone} />
          <Field
            label="Emergency contact"
            value={
              student.medical.emergency_contact_name
                ? `${student.medical.emergency_contact_name} — ${student.medical.emergency_contact_phone ?? ''}`
                : null
            }
          />
          <Field label="Allergies" value={student.medical.allergies} />
          <Field
            label="Address"
            value={`${student.address.line1}, ${student.address.city} ${student.address.postal_code}`}
          />
        </div>

        <div className="border-t border-slate-200 px-3 py-1.5">
          <p className="text-[7px] leading-tight text-slate-500">
            If found, please return to {school?.profile.name ?? 'the school'}
            {school?.profile.phone ? ` · ${school.profile.phone}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
