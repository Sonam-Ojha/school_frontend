import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile } from '@/lib/download';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type { GradeInput, HomeworkInput, SubmissionInput } from '../schemas';
import type {
  Homework,
  HomeworkAttachment,
  HomeworkDetail,
  Submission,
  SubmissionSummary,
} from '../types';

const base = createCrudService<Homework>('/homework');

const toPayload = (input: HomeworkInput) => ({
  title: input.title.trim(),
  description: input.description.trim(),
  class_id: input.class_id,
  section_id: input.section_id,
  subject_id: input.subject_id,
  assigned_date: input.assigned_date,
  due_date: input.due_date,
  max_marks: input.max_marks,
});

export interface SubmissionsResponse {
  data: Submission[];
  summary: SubmissionSummary;
}

export const homeworkService = {
  list: base.list,
  remove: base.remove,

  async show(id: number | string, signal?: AbortSignal): Promise<HomeworkDetail> {
    const { data } = await http.get<ApiResource<HomeworkDetail>>(`/homework/${id}`, { signal });
    return data.data;
  },

  async create(input: HomeworkInput): Promise<HomeworkDetail> {
    const { data } = await http.post<ApiResource<HomeworkDetail>>('/homework', toPayload(input));
    return data.data;
  },

  async update(id: number, input: HomeworkInput): Promise<HomeworkDetail> {
    const { data } = await http.put<ApiResource<HomeworkDetail>>(`/homework/${id}`, toPayload(input));
    return data.data;
  },

  /**
   * Publishing is its own call, not a status field on update.
   *
   * It is the moment students first see the homework and a submission row is
   * raised for each of them — a side effect an ordinary field edit should not
   * carry.
   */
  async publish(id: number): Promise<HomeworkDetail> {
    const { data } = await http.post<ApiResource<HomeworkDetail>>(`/homework/${id}/publish`);
    return data.data;
  },

  /** Stops accepting submissions; everything stays readable. */
  async close(id: number): Promise<HomeworkDetail> {
    const { data } = await http.post<ApiResource<HomeworkDetail>>(`/homework/${id}/close`);
    return data.data;
  },

  // --- attachments ---

  /**
   * Uploads one file.
   *
   * One request per file rather than a batch: a 200 MB video failing must not
   * take three worksheets down with it, and per-file progress is the only way
   * a large upload feels alive.
   */
  async addAttachment(homeworkId: number, file: File): Promise<HomeworkAttachment> {
    const body = new FormData();
    body.append('file', file);

    const { data } = await http.post<ApiResource<HomeworkAttachment>>(
      `/homework/${homeworkId}/attachments`,
      body,
    );
    return data.data;
  },

  async removeAttachment(homeworkId: number, attachmentId: number): Promise<void> {
    await http.delete(`/homework/${homeworkId}/attachments/${attachmentId}`);
  },

  /** Streams through the API so the download stays authorised. */
  async downloadAttachment(homeworkId: number, attachment: HomeworkAttachment): Promise<void> {
    await downloadFile(
      `/homework/${homeworkId}/attachments/${attachment.id}/download`,
      attachment.file_name,
    );
  },

  // --- submissions ---

  async submissions(homeworkId: number, signal?: AbortSignal): Promise<SubmissionsResponse> {
    const { data } = await http.get<SubmissionsResponse>(`/homework/${homeworkId}/submissions`, {
      signal,
    });
    return data;
  },

  /**
   * Records work handed in on paper, on the student's behalf.
   *
   * Real classrooms take homework physically at least as often as digitally,
   * and a teacher must be able to mark it received without inventing a file.
   */
  async recordSubmission(
    homeworkId: number,
    studentId: number,
    input: SubmissionInput,
  ): Promise<Submission> {
    const { data } = await http.post<ApiResource<Submission>>(
      `/homework/${homeworkId}/submissions`,
      { student_id: studentId, student_note: input.student_note.trim() || null },
    );
    return data.data;
  },

  async grade(homeworkId: number, submissionId: number, input: GradeInput): Promise<Submission> {
    const { data } = await http.post<ApiResource<Submission>>(
      `/homework/${homeworkId}/submissions/${submissionId}/grade`,
      { marks_obtained: input.marks_obtained, remarks: input.remarks.trim() || null },
    );
    return data.data;
  },

  /** Undoes a grade, leaving the submission handed in but unmarked. */
  async ungrade(homeworkId: number, submissionId: number): Promise<Submission> {
    const { data } = await http.delete<ApiResource<Submission>>(
      `/homework/${homeworkId}/submissions/${submissionId}/grade`,
    );
    return data.data;
  },

  async submissionAttachments(
    homeworkId: number,
    submissionId: number,
    signal?: AbortSignal,
  ): Promise<HomeworkAttachment[]> {
    const { data } = await http.get<CollectionResponse<HomeworkAttachment>>(
      `/homework/${homeworkId}/submissions/${submissionId}/attachments`,
      { signal },
    );
    return data.data;
  },
};
