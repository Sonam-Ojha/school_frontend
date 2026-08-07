import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { FileAttachment } from '@/components/attachments';
import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import type {
  AssignmentInput,
  EvaluationInput,
  RecordSubmissionInput,
  ReturnForRevisionInput,
} from '../schemas';
import { assignmentService } from '../services/assignmentService';

export const assignmentKeys = createResourceKeys('assignments');

/** Submissions live under their assignment, so deleting one clears the other. */
export const assignmentSubmissionKeys = (assignmentId: number) =>
  [...assignmentKeys.detail(assignmentId), 'submissions'] as const;

export function useAssignmentList(params: ListQueryParams) {
  return useQuery({
    queryKey: assignmentKeys.list(params),
    queryFn: ({ signal }) => assignmentService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useAssignment(id: number | string | undefined) {
  return useQuery({
    queryKey: assignmentKeys.detail(id ?? ''),
    queryFn: ({ signal }) => assignmentService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

export function useAssignmentSubmissions(assignmentId: number | undefined) {
  return useQuery({
    queryKey: assignmentSubmissionKeys(assignmentId ?? 0),
    queryFn: ({ signal }) => assignmentService.submissions(assignmentId!, signal),
    enabled: assignmentId !== undefined,
  });
}

function useInvalidateAssignments() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
}

export function useCreateAssignment() {
  const invalidate = useInvalidateAssignments();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignmentInput) => assignmentService.create(input),
    onSuccess: async (assignment) => {
      // Prime the detail cache — the next screen is this record's page.
      queryClient.setQueryData(assignmentKeys.detail(assignment.id), assignment);
      await invalidate();
      toast.success('Assignment saved as a draft', 'Attach the brief, then publish it.');
    },
  });
}

export function useUpdateAssignment(id: number) {
  const invalidate = useInvalidateAssignments();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignmentInput) => assignmentService.update(id, input),
    onSuccess: async (assignment) => {
      queryClient.setQueryData(assignmentKeys.detail(id), assignment);
      await invalidate();
      toast.success('Assignment updated', assignment.title);
    },
  });
}

export function useDeleteAssignment() {
  const invalidate = useInvalidateAssignments();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => assignmentService.remove(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: assignmentKeys.detail(id) });
      await invalidate();
      toast.success('Assignment deleted');
    },
  });
}

export function usePublishAssignment(id: number) {
  const invalidate = useInvalidateAssignments();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => assignmentService.publish(id),
    onSuccess: async (assignment) => {
      queryClient.setQueryData(assignmentKeys.detail(id), assignment);
      await invalidate();
      toast.success(
        'Assignment published',
        `${assignment.students_count} student${assignment.students_count === 1 ? '' : 's'} can now see it.`,
      );
    },
  });
}

export function useCloseAssignment(id: number) {
  const invalidate = useInvalidateAssignments();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => assignmentService.close(id),
    onSuccess: async (assignment) => {
      queryClient.setQueryData(assignmentKeys.detail(id), assignment);
      await invalidate();
      toast.success('Assignment closed', 'No further submissions will be accepted.');
    },
  });
}

// --- attachments ------------------------------------------------------------

export function useAddAssignmentAttachment(assignmentId: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateAssignments();

  return useMutation({
    mutationFn: (file: File) => assignmentService.addAttachment(assignmentId, file),
    onSuccess: async (attachment) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) }),
        invalidate(),
      ]);
      toast.success('Attachment added', attachment.file_name);
    },
  });
}

export function useRemoveAssignmentAttachment(assignmentId: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateAssignments();

  return useMutation({
    mutationFn: (attachmentId: number) =>
      assignmentService.removeAttachment(assignmentId, attachmentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) }),
        invalidate(),
      ]);
      toast.success('Attachment removed');
    },
  });
}

export function useDownloadAssignmentAttachment(assignmentId: number) {
  return useMutation({
    mutationFn: (attachment: FileAttachment) =>
      assignmentService.downloadAttachment(assignmentId, attachment),
    onError: (error) => toast.error('Download failed', error.message),
    meta: { skipGlobalError: true },
  });
}

// --- submissions ------------------------------------------------------------

/**
 * Evaluating changes the assignment's `evaluated_count`, so both caches
 * refresh together.
 */
function useInvalidateSubmissions(assignmentId: number) {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: assignmentSubmissionKeys(assignmentId) }),
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
    ]);
  };
}

export function useRecordAssignmentSubmission(assignmentId: number) {
  const invalidate = useInvalidateSubmissions(assignmentId);

  return useMutation({
    mutationFn: ({ studentId, input }: { studentId: number; input: RecordSubmissionInput }) =>
      assignmentService.recordSubmission(assignmentId, studentId, input),
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

export function useAddSubmissionAttachment(assignmentId: number, submissionId: number) {
  const invalidate = useInvalidateSubmissions(assignmentId);

  return useMutation({
    mutationFn: (file: File) =>
      assignmentService.addSubmissionAttachment(assignmentId, submissionId, file),
    onSuccess: async (attachment) => {
      await invalidate();
      toast.success('File added to the submission', attachment.file_name);
    },
  });
}

export function useDownloadSubmissionAttachment(assignmentId: number, submissionId: number) {
  return useMutation({
    mutationFn: (attachment: FileAttachment) =>
      assignmentService.downloadSubmissionAttachment(assignmentId, submissionId, attachment),
    onError: (error) => toast.error('Download failed', error.message),
    meta: { skipGlobalError: true },
  });
}

// --- evaluation -------------------------------------------------------------

export function useEvaluateSubmission(assignmentId: number) {
  const invalidate = useInvalidateSubmissions(assignmentId);

  return useMutation({
    mutationFn: ({ submissionId, input }: { submissionId: number; input: EvaluationInput }) =>
      assignmentService.evaluate(assignmentId, submissionId, input),
    onSuccess: async (submission) => {
      await invalidate();
      toast.success(
        'Evaluated',
        submission.evaluation
          ? `${submission.student_name} — ${submission.evaluation.final_marks} marks (${submission.evaluation.grade}).`
          : submission.student_name,
      );
    },
  });
}

export function useClearEvaluation(assignmentId: number) {
  const invalidate = useInvalidateSubmissions(assignmentId);

  return useMutation({
    mutationFn: (submissionId: number) =>
      assignmentService.clearEvaluation(assignmentId, submissionId),
    onSuccess: async (submission) => {
      await invalidate();
      toast.success('Evaluation cleared', `${submission.student_name} is unmarked again.`);
    },
  });
}

export function useReturnForRevision(assignmentId: number) {
  const invalidate = useInvalidateSubmissions(assignmentId);

  return useMutation({
    mutationFn: ({
      submissionId,
      input,
    }: {
      submissionId: number;
      input: ReturnForRevisionInput;
    }) => assignmentService.returnForRevision(assignmentId, submissionId, input),
    onSuccess: async (submission) => {
      await invalidate();
      toast.success(
        'Returned for revision',
        `${submission.student_name} can submit again — attempt ${submission.attempt + 1}.`,
      );
    },
  });
}

// --- marks ------------------------------------------------------------------

export function usePublishMarks(assignmentId: number) {
  const invalidate = useInvalidateSubmissions(assignmentId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => assignmentService.publishMarks(assignmentId),
    onSuccess: async (assignment) => {
      queryClient.setQueryData(assignmentKeys.detail(assignmentId), assignment);
      await invalidate();
      toast.success(
        'Marks published',
        'Students and their guardians can now see their marks and feedback.',
      );
    },
  });
}

export function useExportMarks(assignmentId: number) {
  return useMutation({
    mutationFn: (title: string) => assignmentService.exportMarks(assignmentId, title),
    onError: (error) => toast.error('Export failed', error.message),
    meta: { skipGlobalError: true },
  });
}
