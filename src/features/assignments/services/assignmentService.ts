import type { FileAttachment } from '@/components/attachments';
import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type { ApiResource } from '@/types/api';

import type {
  AssignmentInput,
  EvaluationInput,
  RecordSubmissionInput,
  ReturnForRevisionInput,
} from '../schemas';
import type {
  Assignment,
  AssignmentDetail,
  AssignmentSubmission,
  MarksSummary,
} from '../types';

const base = createCrudService<Assignment>('/assignments');

const toPayload = (input: AssignmentInput) => ({
  title: input.title.trim(),
  instructions: input.instructions.trim(),
  type: input.type,
  class_id: input.class_id,
  section_id: input.section_id,
  subject_id: input.subject_id,
  assigned_date: input.assigned_date,
  due_date: input.due_date,
  max_marks: input.max_marks,
  weightage_percent: input.weightage_percent,
  allows_late_submission: input.allows_late_submission,
  late_penalty_percent: input.allows_late_submission ? input.late_penalty_percent : 0,
  rubric: input.rubric.map((criterion) => ({
    // A criterion the teacher just added has no server id yet.
    ...(criterion.id > 0 ? { id: criterion.id } : {}),
    name: criterion.name.trim(),
    description: criterion.description.trim() || null,
    max_marks: criterion.max_marks,
  })),
});

export interface SubmissionsResponse {
  data: AssignmentSubmission[];
  summary: MarksSummary;
}

export const assignmentService = {
  list: base.list,
  remove: base.remove,

  async show(id: number | string, signal?: AbortSignal): Promise<AssignmentDetail> {
    const { data } = await http.get<ApiResource<AssignmentDetail>>(`/assignments/${id}`, { signal });
    return data.data;
  },

  async create(input: AssignmentInput): Promise<AssignmentDetail> {
    const { data } = await http.post<ApiResource<AssignmentDetail>>(
      '/assignments',
      toPayload(input),
    );
    return data.data;
  },

  async update(id: number, input: AssignmentInput): Promise<AssignmentDetail> {
    const { data } = await http.put<ApiResource<AssignmentDetail>>(
      `/assignments/${id}`,
      toPayload(input),
    );
    return data.data;
  },

  /**
   * Publishing is its own call, not a status field on update.
   *
   * It is the moment students first see the assignment and a submission row is
   * raised for each of them — a side effect an ordinary field edit should not
   * carry.
   */
  async publish(id: number): Promise<AssignmentDetail> {
    const { data } = await http.post<ApiResource<AssignmentDetail>>(`/assignments/${id}/publish`);
    return data.data;
  },

  /** Stops accepting submissions; evaluation carries on. */
  async close(id: number): Promise<AssignmentDetail> {
    const { data } = await http.post<ApiResource<AssignmentDetail>>(`/assignments/${id}/close`);
    return data.data;
  },

  // --- attachments ---

  /**
   * Uploads one file.
   *
   * One request per file rather than a batch: a 200 MB screen recording
   * failing must not take three worksheets down with it, and per-file progress
   * is the only way a large upload feels alive.
   */
  async addAttachment(assignmentId: number, file: File): Promise<FileAttachment> {
    const body = new FormData();
    body.append('file', file);

    const { data } = await http.post<ApiResource<FileAttachment>>(
      `/assignments/${assignmentId}/attachments`,
      body,
    );
    return data.data;
  },

  async removeAttachment(assignmentId: number, attachmentId: number): Promise<void> {
    await http.delete(`/assignments/${assignmentId}/attachments/${attachmentId}`);
  },

  /** Streams through the API so the download stays authorised. */
  async downloadAttachment(assignmentId: number, attachment: FileAttachment): Promise<void> {
    await downloadFile(
      `/assignments/${assignmentId}/attachments/${attachment.id}/download`,
      attachment.file_name,
    );
  },

  // --- submissions ---

  async submissions(assignmentId: number, signal?: AbortSignal): Promise<SubmissionsResponse> {
    const { data } = await http.get<SubmissionsResponse>(
      `/assignments/${assignmentId}/submissions`,
      { signal },
    );
    return data;
  },

  /**
   * Records work handed in offline, on the student's behalf.
   *
   * A model, a poster and a bound report do not have a file to upload, and a
   * teacher must be able to mark them received without inventing one.
   */
  async recordSubmission(
    assignmentId: number,
    studentId: number,
    input: RecordSubmissionInput,
  ): Promise<AssignmentSubmission> {
    const { data } = await http.post<ApiResource<AssignmentSubmission>>(
      `/assignments/${assignmentId}/submissions`,
      { student_id: studentId, student_note: input.student_note.trim() || null },
    );
    return data.data;
  },

  async addSubmissionAttachment(
    assignmentId: number,
    submissionId: number,
    file: File,
  ): Promise<FileAttachment> {
    const body = new FormData();
    body.append('file', file);

    const { data } = await http.post<ApiResource<FileAttachment>>(
      `/assignments/${assignmentId}/submissions/${submissionId}/attachments`,
      body,
    );
    return data.data;
  },

  async downloadSubmissionAttachment(
    assignmentId: number,
    submissionId: number,
    attachment: FileAttachment,
  ): Promise<void> {
    await downloadFile(
      `/assignments/${assignmentId}/submissions/${submissionId}/attachments/${attachment.id}/download`,
      attachment.file_name,
    );
  },

  // --- evaluation ---

  /**
   * Scores a submission against the rubric.
   *
   * The total, the late penalty and the grade are all computed server-side
   * from these per-criterion marks — sending a total the client worked out
   * would let two answers disagree.
   */
  async evaluate(
    assignmentId: number,
    submissionId: number,
    input: EvaluationInput,
  ): Promise<AssignmentSubmission> {
    const { data } = await http.post<ApiResource<AssignmentSubmission>>(
      `/assignments/${assignmentId}/submissions/${submissionId}/evaluation`,
      {
        criteria_scores: input.criteria_scores.map((score) => ({
          criterion_id: score.criterion_id,
          marks_awarded: score.marks_awarded,
          comment: score.comment.trim() || null,
        })),
        feedback: input.feedback.trim() || null,
        waive_late_penalty: input.waive_late_penalty,
      },
    );
    return data.data;
  },

  /** Undoes an evaluation, leaving the submission handed in but unmarked. */
  async clearEvaluation(
    assignmentId: number,
    submissionId: number,
  ): Promise<AssignmentSubmission> {
    const { data } = await http.delete<ApiResource<AssignmentSubmission>>(
      `/assignments/${assignmentId}/submissions/${submissionId}/evaluation`,
    );
    return data.data;
  },

  /** Hands work back for revision — the student may submit again. */
  async returnForRevision(
    assignmentId: number,
    submissionId: number,
    input: ReturnForRevisionInput,
  ): Promise<AssignmentSubmission> {
    const { data } = await http.post<ApiResource<AssignmentSubmission>>(
      `/assignments/${assignmentId}/submissions/${submissionId}/return`,
      { feedback: input.feedback.trim() },
    );
    return data.data;
  },

  // --- marks ---

  /**
   * Releases every evaluation at once.
   *
   * Marks are a teacher's working note until this is called; releasing them
   * one at a time would let a class compare partial results and read an
   * unfinished pass as a final one.
   */
  async publishMarks(assignmentId: number): Promise<AssignmentDetail> {
    const { data } = await http.post<ApiResource<AssignmentDetail>>(
      `/assignments/${assignmentId}/marks/publish`,
    );
    return data.data;
  },

  async exportMarks(assignmentId: number, title: string): Promise<void> {
    await downloadFile(
      `/assignments/${assignmentId}/marks/export`,
      timestampedFilename(`marks-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, 'csv'),
    );
  },
};
