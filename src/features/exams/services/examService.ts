import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type { ExamInput, MarkInput, PaperInput, PublishResultsInput } from '../schemas';
import type {
  Exam,
  ExamDetail,
  ExamPaper,
  ExamResults,
  PaperMark,
  PaperMarksSummary,
  ReportCard,
} from '../types';

const base = createCrudService<Exam>('/exams');

const nullable = (value: string): string | null => value.trim() || null;

const toExamPayload = (input: ExamInput) => ({
  name: input.name.trim(),
  type: input.type,
  academic_year_id: input.academic_year_id,
  start_date: input.start_date,
  end_date: input.end_date,
  description: nullable(input.description),
});

const toPaperPayload = (input: PaperInput) => ({
  class_id: input.class_id,
  section_id: input.section_id,
  subject_id: input.subject_id,
  exam_date: input.exam_date,
  start_time: input.start_time,
  duration_minutes: input.duration_minutes,
  room: nullable(input.room),
  max_marks: input.max_marks,
  pass_marks: input.pass_marks,
});

export interface PaperMarksResponse {
  paper: ExamPaper;
  data: PaperMark[];
  summary: PaperMarksSummary;
}

export interface ResultsQuery {
  classId: number;
  sectionId?: number | null;
}

export const examService = {
  list: base.list,
  remove: base.remove,

  async show(id: number | string, signal?: AbortSignal): Promise<ExamDetail> {
    const { data } = await http.get<ApiResource<ExamDetail>>(`/exams/${id}`, { signal });
    return data.data;
  },

  async create(input: ExamInput): Promise<ExamDetail> {
    const { data } = await http.post<ApiResource<ExamDetail>>('/exams', toExamPayload(input));
    return data.data;
  },

  async update(id: number, input: ExamInput): Promise<ExamDetail> {
    const { data } = await http.put<ApiResource<ExamDetail>>(`/exams/${id}`, toExamPayload(input));
    return data.data;
  },

  /** Moves a draft to `scheduled`, making the timetable visible. */
  async publishSchedule(id: number): Promise<ExamDetail> {
    const { data } = await http.post<ApiResource<ExamDetail>>(`/exams/${id}/publish-schedule`);
    return data.data;
  },

  // --- papers ---

  async addPaper(examId: number, input: PaperInput): Promise<ExamPaper> {
    const { data } = await http.post<ApiResource<ExamPaper>>(
      `/exams/${examId}/papers`,
      toPaperPayload(input),
    );
    return data.data;
  },

  async updatePaper(examId: number, paperId: number, input: PaperInput): Promise<ExamPaper> {
    const { data } = await http.put<ApiResource<ExamPaper>>(
      `/exams/${examId}/papers/${paperId}`,
      toPaperPayload(input),
    );
    return data.data;
  },

  async removePaper(examId: number, paperId: number): Promise<void> {
    await http.delete(`/exams/${examId}/papers/${paperId}`);
  },

  /** Printable timetable for the whole exam. */
  async downloadSchedule(exam: Exam): Promise<void> {
    await downloadFile(`/exams/${exam.id}/schedule/export`, `timetable-${exam.id}.pdf`);
  },

  // --- marks ---

  async paperMarks(
    examId: number,
    paperId: number,
    signal?: AbortSignal,
  ): Promise<PaperMarksResponse> {
    const { data } = await http.get<PaperMarksResponse>(
      `/exams/${examId}/papers/${paperId}/marks`,
      { signal },
    );
    return data;
  },

  /**
   * Saves the changed rows of a marks sheet.
   *
   * Batched, like attendance: entering a class of forty one request at a time
   * would half-save on a dropped connection.
   */
  async saveMarks(examId: number, paperId: number, marks: MarkInput[]): Promise<PaperMarksResponse> {
    const { data } = await http.post<PaperMarksResponse>(
      `/exams/${examId}/papers/${paperId}/marks`,
      {
        marks: marks.map((mark) => ({
          student_id: mark.student_id,
          marks_obtained: mark.is_absent ? null : mark.marks_obtained,
          is_absent: mark.is_absent,
          remarks: mark.remarks.trim() || null,
        })),
      },
    );
    return data;
  },

  // --- results ---

  /**
   * Results for one class, computed from the marks.
   *
   * Never stored: a result derived on read cannot drift from the marks it is
   * derived from, which is exactly what a cached total would eventually do.
   */
  async results(examId: number, query: ResultsQuery, signal?: AbortSignal): Promise<ExamResults> {
    const { data } = await http.get<ApiResource<ExamResults>>(`/exams/${examId}/results`, {
      params: {
        class_id: query.classId,
        ...(query.sectionId ? { section_id: query.sectionId } : {}),
      },
      signal,
    });
    return data.data;
  },

  /** Releases results to students and guardians, and freezes the ranks. */
  async publishResults(examId: number, input: PublishResultsInput): Promise<ExamResults> {
    const { data } = await http.post<ApiResource<ExamResults>>(`/exams/${examId}/results/publish`, {
      class_id: input.class_id,
      section_id: input.section_id,
      remarks: nullable(input.remarks),
    });
    return data.data;
  },

  async exportResults(
    examId: number,
    query: ResultsQuery,
    format: 'pdf' | 'excel',
  ): Promise<void> {
    const extension = format === 'excel' ? 'xlsx' : 'pdf';

    await downloadFile(
      `/exams/${examId}/results/export`,
      timestampedFilename(`results-exam-${examId}`, extension),
      {
        params: {
          class_id: query.classId,
          ...(query.sectionId ? { section_id: query.sectionId } : {}),
          format,
        },
      },
    );
  },

  // --- report cards ---

  async reportCard(examId: number, studentId: number, signal?: AbortSignal): Promise<ReportCard> {
    const { data } = await http.get<ApiResource<ReportCard>>(
      `/exams/${examId}/report-cards/${studentId}`,
      { signal },
    );
    return data.data;
  },

  /** Server-rendered report card, for a print run that must match exactly. */
  async downloadReportCard(examId: number, card: ReportCard): Promise<void> {
    await downloadFile(
      `/exams/${examId}/report-cards/${card.result.student_id}/pdf`,
      `report-card-${card.result.admission_no}.pdf`,
    );
  },

  /** Every report card in a class, as one PDF for the print room. */
  async downloadClassReportCards(examId: number, query: ResultsQuery): Promise<void> {
    await downloadFile(
      `/exams/${examId}/report-cards/bulk`,
      timestampedFilename(`report-cards-class-${query.classId}`, 'pdf'),
      {
        params: {
          class_id: query.classId,
          ...(query.sectionId ? { section_id: query.sectionId } : {}),
        },
      },
    );
  },

  /** Classes this exam has papers for — the results screen's class picker. */
  async examClasses(examId: number, signal?: AbortSignal): Promise<{ id: number; name: string }[]> {
    const { data } = await http.get<CollectionResponse<{ id: number; name: string }>>(
      `/exams/${examId}/classes`,
      { signal },
    );
    return data.data;
  },
};
