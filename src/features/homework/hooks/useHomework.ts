import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import type { GradeInput, HomeworkInput, SubmissionInput } from '../schemas';
import { homeworkService } from '../services/homeworkService';

export const homeworkKeys = createResourceKeys('homework');

/** Submissions live under their homework, so deleting one clears the other. */
export const submissionKeys = (homeworkId: number) =>
  [...homeworkKeys.detail(homeworkId), 'submissions'] as const;

export function useHomeworkList(params: ListQueryParams) {
  return useQuery({
    queryKey: homeworkKeys.list(params),
    queryFn: ({ signal }) => homeworkService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useHomework(id: number | string | undefined) {
  return useQuery({
    queryKey: homeworkKeys.detail(id ?? ''),
    queryFn: ({ signal }) => homeworkService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

export function useSubmissions(homeworkId: number | undefined) {
  return useQuery({
    queryKey: submissionKeys(homeworkId ?? 0),
    queryFn: ({ signal }) => homeworkService.submissions(homeworkId!, signal),
    enabled: homeworkId !== undefined,
  });
}

function useInvalidateHomework() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
}

export function useCreateHomework() {
  const invalidate = useInvalidateHomework();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: HomeworkInput) => homeworkService.create(input),
    onSuccess: async (homework) => {
      // Prime the detail cache — the next screen is this record's page.
      queryClient.setQueryData(homeworkKeys.detail(homework.id), homework);
      await invalidate();
      toast.success('Homework saved as a draft', 'Add attachments, then publish it.');
    },
  });
}

export function useUpdateHomework(id: number) {
  const invalidate = useInvalidateHomework();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: HomeworkInput) => homeworkService.update(id, input),
    onSuccess: async (homework) => {
      queryClient.setQueryData(homeworkKeys.detail(id), homework);
      await invalidate();
      toast.success('Homework updated', homework.title);
    },
  });
}

export function useDeleteHomework() {
  const invalidate = useInvalidateHomework();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => homeworkService.remove(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: homeworkKeys.detail(id) });
      await invalidate();
      toast.success('Homework deleted');
    },
  });
}

export function usePublishHomework(id: number) {
  const invalidate = useInvalidateHomework();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => homeworkService.publish(id),
    onSuccess: async (homework) => {
      queryClient.setQueryData(homeworkKeys.detail(id), homework);
      await invalidate();
      toast.success(
        'Homework published',
        `${homework.students_count} student${homework.students_count === 1 ? '' : 's'} can now see it.`,
      );
    },
  });
}

export function useCloseHomework(id: number) {
  const invalidate = useInvalidateHomework();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => homeworkService.close(id),
    onSuccess: async (homework) => {
      queryClient.setQueryData(homeworkKeys.detail(id), homework);
      await invalidate();
      toast.success('Homework closed', 'No further submissions will be accepted.');
    },
  });
}

// --- attachments ------------------------------------------------------------

export function useAddAttachment(homeworkId: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateHomework();

  return useMutation({
    mutationFn: (file: File) => homeworkService.addAttachment(homeworkId, file),
    onSuccess: async (attachment) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: homeworkKeys.detail(homeworkId) }),
        invalidate(),
      ]);
      toast.success('Attachment added', attachment.file_name);
    },
  });
}

export function useRemoveAttachment(homeworkId: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateHomework();

  return useMutation({
    mutationFn: (attachmentId: number) =>
      homeworkService.removeAttachment(homeworkId, attachmentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: homeworkKeys.detail(homeworkId) }),
        invalidate(),
      ]);
      toast.success('Attachment removed');
    },
  });
}

export function useDownloadAttachment(homeworkId: number) {
  return useMutation({
    mutationFn: (attachment: Parameters<typeof homeworkService.downloadAttachment>[1]) =>
      homeworkService.downloadAttachment(homeworkId, attachment),
    onError: (error) => toast.error('Download failed', error.message),
    meta: { skipGlobalError: true },
  });
}

// --- submissions ------------------------------------------------------------

/** Grading changes the homework's `graded_count`, so both caches refresh. */
function useInvalidateSubmissions(homeworkId: number) {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: submissionKeys(homeworkId) }),
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all }),
    ]);
  };
}

export function useRecordSubmission(homeworkId: number) {
  const invalidate = useInvalidateSubmissions(homeworkId);

  return useMutation({
    mutationFn: ({ studentId, input }: { studentId: number; input: SubmissionInput }) =>
      homeworkService.recordSubmission(homeworkId, studentId, input),
    onSuccess: async (submission) => {
      await invalidate();
      toast.success(
        'Marked as handed in',
        submission.days_late > 0
          ? `${submission.student_name} — ${submission.days_late} day${submission.days_late === 1 ? '' : 's'} late.`
          : submission.student_name,
      );
    },
  });
}

export function useGradeSubmission(homeworkId: number) {
  const invalidate = useInvalidateSubmissions(homeworkId);

  return useMutation({
    mutationFn: ({ submissionId, input }: { submissionId: number; input: GradeInput }) =>
      homeworkService.grade(homeworkId, submissionId, input),
    onSuccess: async (submission) => {
      await invalidate();
      toast.success('Graded', `${submission.student_name} — ${submission.marks_obtained} marks.`);
    },
  });
}

export function useUngradeSubmission(homeworkId: number) {
  const invalidate = useInvalidateSubmissions(homeworkId);

  return useMutation({
    mutationFn: (submissionId: number) => homeworkService.ungrade(homeworkId, submissionId),
    onSuccess: async (submission) => {
      await invalidate();
      toast.success('Grade removed', `${submission.student_name} is unmarked again.`);
    },
  });
}
