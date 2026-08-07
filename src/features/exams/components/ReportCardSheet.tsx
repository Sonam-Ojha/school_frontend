import { GraduationCap } from 'lucide-react';

import type { SchoolSettings } from '@/features/settings/types';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { GRADE_BANDS } from '@/lib/grading';

import { EXAM_TYPE_LABELS } from '../constants';
import type { ReportCard } from '../types';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="truncate text-sm font-medium text-slate-900">{value || '—'}</p>
    </div>
  );
}

/**
 * Printable report card.
 *
 * Laid out for A4 and marked `print-exact` so the header and the pass/fail
 * banding survive printing — a report card whose colours drop out is one a
 * parent has to decode. The grade key is printed on the card because a letter
 * with no scale beside it means nothing at home.
 */
export function ReportCardSheet({
  card,
  school,
}: {
  card: ReportCard;
  school: SchoolSettings | undefined;
}) {
  const { result, exam } = card;

  return (
    <div className="print-exact mx-auto max-w-3xl bg-white p-6">
      <header className="flex items-start gap-3 border-b-2 border-slate-800 pb-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white">
          {school?.logo_url ? (
            <img src={school.logo_url} alt="" className="size-8 object-contain" />
          ) : (
            <GraduationCap className="size-6" aria-hidden />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-slate-900">
            {school?.profile.name ?? 'School'}
          </p>
          <p className="truncate text-xs text-slate-600">
            {school
              ? `${school.address.line1}, ${school.address.city} ${school.address.postal_code}`
              : ''}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {exam.name} — {EXAM_TYPE_LABELS[exam.type]}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] tracking-wide text-slate-500 uppercase">Report card</p>
          <p className="text-xs text-slate-600">{exam.academic_year_name}</p>
          <p className="text-xs text-slate-600">
            {formatDate(exam.start_date)} – {formatDate(exam.end_date)}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 border-b border-slate-200 py-3 sm:grid-cols-4">
        <Field label="Student" value={result.student_name} />
        <Field label="Admission no." value={result.admission_no} />
        <Field
          label="Class"
          value={`${result.class_name}${result.section_name ? ` — ${result.section_name}` : ''}`}
        />
        <Field label="Roll no." value={result.roll_no ?? '—'} />
      </section>

      <table className="w-full border-collapse py-3 text-sm">
        <thead>
          <tr className="border-b border-slate-300">
            <th scope="col" className="py-2 text-left text-[10px] tracking-wide text-slate-500 uppercase">
              Subject
            </th>
            <th scope="col" className="py-2 text-right text-[10px] tracking-wide text-slate-500 uppercase">
              Max
            </th>
            <th scope="col" className="py-2 text-right text-[10px] tracking-wide text-slate-500 uppercase">
              Pass
            </th>
            <th scope="col" className="py-2 text-right text-[10px] tracking-wide text-slate-500 uppercase">
              Obtained
            </th>
            <th scope="col" className="py-2 text-center text-[10px] tracking-wide text-slate-500 uppercase">
              Grade
            </th>
            <th scope="col" className="py-2 text-center text-[10px] tracking-wide text-slate-500 uppercase">
              Result
            </th>
          </tr>
        </thead>

        <tbody>
          {result.subjects.map((subject) => (
            <tr key={subject.paper_id} className="border-b border-slate-100">
              <td className="py-1.5 text-slate-800">
                {subject.subject_name}
                <span className="ml-1.5 text-xs text-slate-400">{subject.subject_code}</span>
              </td>
              <td className="py-1.5 text-right text-slate-600">{subject.max_marks}</td>
              <td className="py-1.5 text-right text-slate-600">{subject.pass_marks}</td>
              <td
                className={cn(
                  'py-1.5 text-right font-medium',
                  subject.is_absent
                    ? 'text-slate-400'
                    : subject.is_pass
                      ? 'text-slate-900'
                      : 'text-red-700',
                )}
              >
                {subject.is_absent ? 'Absent' : (subject.marks_obtained ?? '—')}
              </td>
              <td className="py-1.5 text-center text-slate-800">{subject.grade}</td>
              <td
                className={cn(
                  'py-1.5 text-center text-xs font-semibold',
                  subject.is_pass ? 'text-emerald-700' : 'text-red-700',
                )}
              >
                {subject.is_pass ? 'Pass' : 'Fail'}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="border-t-2 border-slate-800">
            <td className="py-2 text-sm font-bold text-slate-900">Total</td>
            <td className="py-2 text-right text-sm font-bold text-slate-900">
              {result.total_max_marks}
            </td>
            <td className="py-2" />
            <td className="py-2 text-right text-sm font-bold text-slate-900">
              {result.total_marks}
            </td>
            <td className="py-2 text-center text-sm font-bold text-slate-900">{result.grade}</td>
            <td
              className={cn(
                'py-2 text-center text-xs font-bold',
                result.is_pass ? 'text-emerald-700' : 'text-red-700',
              )}
            >
              {result.is_pass ? 'PASS' : 'FAIL'}
            </td>
          </tr>
        </tfoot>
      </table>

      <section className="grid grid-cols-2 gap-3 border-y border-slate-200 py-3 sm:grid-cols-4">
        <Field label="Percentage" value={`${result.percent}%`} />
        <Field
          label="Rank"
          value={result.rank ? `${result.rank} of ${card.class_strength}` : 'Not ranked'}
        />
        <Field
          label="Attendance"
          value={card.attendance_percent === null ? '—' : `${card.attendance_percent}%`}
        />
        <Field label="Class teacher" value={card.class_teacher_name ?? '—'} />
      </section>

      {card.remarks && (
        <section className="border-b border-slate-200 py-3">
          <p className="text-[10px] tracking-wide text-slate-500 uppercase">Remarks</p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-slate-800">{card.remarks}</p>
        </section>
      )}

      {/* A letter with no scale beside it means nothing at home. */}
      <section className="py-3">
        <p className="text-[10px] tracking-wide text-slate-500 uppercase">Grading scale</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          {GRADE_BANDS.map((band, index) => {
            const upper = index === 0 ? 100 : GRADE_BANDS[index - 1].min_percent - 1;
            return (
              <span key={band.grade} className="text-[10px] text-slate-600">
                <span className="font-semibold text-slate-800">{band.grade}</span>{' '}
                {band.min_percent}–{upper}%
              </span>
            );
          })}
        </div>
      </section>

      <footer className="mt-6 flex items-end justify-between border-t border-slate-200 pt-4">
        <p className="text-[10px] text-slate-500">
          {card.published_at
            ? `Published ${formatDate(card.published_at)}`
            : 'Provisional — results not yet published'}
          <br />
          This is a computer-generated report card.
        </p>

        <div className="flex gap-8">
          {['Class teacher', 'Principal'].map((label) => (
            <div key={label} className="text-center">
              <div className="h-8 w-28 border-b border-slate-400" />
              <p className="mt-1 text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
