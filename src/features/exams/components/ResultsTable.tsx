import { FileText } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { toneForGrade } from '@/lib/grading';

import type { ExamResults, StudentResult } from '../types';

interface ResultsTableProps {
  results: ExamResults;
  onOpenReportCard: (row: StudentResult) => void;
  canPrint: boolean;
}

/**
 * Class results, subject by subject.
 *
 * Wide by nature — one column per paper plus totals — so it scrolls inside its
 * own container with the student column pinned, rather than pushing the page
 * sideways.
 */
export function ResultsTable({ results, onOpenReportCard, canPrint }: ResultsTableProps) {
  if (results.rows.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="size-6" />}
        title="No results yet"
        description="Results appear once marks have been entered for at least one paper in this class."
      />
    );
  }

  // Every row carries the same papers, so the first defines the columns.
  const subjects = results.rows[0].subjects;

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th
              scope="col"
              className="sticky left-0 z-10 min-w-52 bg-slate-50 px-4 py-2.5 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase"
            >
              Student
            </th>

            {subjects.map((subject) => (
              <th
                key={subject.paper_id}
                scope="col"
                className="min-w-20 px-2 py-2.5 text-center text-xs font-semibold text-slate-600"
                title={subject.subject_name}
              >
                {subject.subject_code}
                <span className="block text-[10px] font-normal text-slate-400">
                  /{subject.max_marks}
                </span>
              </th>
            ))}

            {(['Total', '%', 'Grade', 'Rank', 'Result'] as const).map((label) => (
              <th
                key={label}
                scope="col"
                className="px-3 py-2.5 text-center text-xs font-semibold tracking-wide text-slate-600 uppercase"
              >
                {label}
              </th>
            ))}

            {canPrint && <th scope="col" className="w-px px-3 py-2.5" />}
          </tr>
        </thead>

        <tbody>
          {results.rows.map((row) => (
            <tr key={row.student_id} className="border-b border-slate-100 last:border-0">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white px-4 py-2 text-left font-normal"
              >
                <p className="truncate text-sm text-slate-900">{row.student_name}</p>
                <p className="truncate text-xs text-slate-500">
                  <code>{row.admission_no}</code>
                  {row.roll_no && ` · roll ${row.roll_no}`}
                </p>
              </th>

              {row.subjects.map((subject) => (
                <td key={subject.paper_id} className="px-2 py-2 text-center">
                  {subject.is_absent ? (
                    <span className="text-xs font-medium text-slate-400">AB</span>
                  ) : subject.marks_obtained === null ? (
                    <span className="text-slate-300">·</span>
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        subject.is_pass ? 'text-slate-900' : 'text-red-700',
                      )}
                    >
                      {subject.marks_obtained}
                    </span>
                  )}
                </td>
              ))}

              <td className="px-3 py-2 text-center text-sm font-semibold text-slate-900">
                {row.total_marks}
                <span className="text-xs font-normal text-slate-400">/{row.total_max_marks}</span>
              </td>
              <td className="px-3 py-2 text-center text-sm font-medium text-slate-900">
                {row.percent}%
              </td>
              <td className="px-3 py-2 text-center">
                <Badge tone={toneForGrade(row.grade)}>{row.grade}</Badge>
              </td>
              <td className="px-3 py-2 text-center text-sm text-slate-700">
                {/* Ranks are frozen at publication — blank until then. */}
                {row.rank ?? <span className="text-slate-300">—</span>}
              </td>
              <td className="px-3 py-2 text-center">
                {row.is_pass ? (
                  <Badge tone="success">Pass</Badge>
                ) : (
                  <Badge tone="danger">
                    Fail
                    {row.failed_subjects > 1 && ` (${row.failed_subjects})`}
                  </Badge>
                )}
              </td>

              {canPrint && (
                <td className="px-3 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Report card for ${row.student_name}`}
                    onClick={() => onOpenReportCard(row)}
                    leftIcon={<FileText className="size-4" />}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
