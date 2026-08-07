import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import type { ExamInput, MarkInput, PaperInput, PublishResultsInput } from '../schemas';
import { examService, type ResultsQuery } from '../services/examService';

export const examKeys = {
  ...createResourceKeys('exams'),
  marks: (examId: number, paperId: number) => ['exams', 'marks', examId, paperId] as const,
  results: (examId: number, query: ResultsQuery) => ['exams', 'results', examId, query] as const,
  classes: (examId: number) => ['exams', 'classes', examId] as const,
  reportCard: (examId: number, studentId: number) =>
    ['exams', 'report-card', examId, studentId] as const,
};

export function useExams(params: ListQueryParams) {
  return useQuery({
    queryKey: examKeys.list(params),
    queryFn: ({ signal }) => examService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useExam(id: number | string | undefined) {
  return useQuery({
    queryKey: examKeys.detail(id ?? ''),
    queryFn: ({ signal }) => examService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

function useInvalidateExams() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: examKeys.all });
}

export function useCreateExam() {
  const invalidate = useInvalidateExams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ExamInput) => examService.create(input),
    onSuccess: async (exam) => {
      queryClient.setQueryData(examKeys.detail(exam.id), exam);
      await invalidate();
      toast.success('Exam created', 'Add the papers, then publish the timetable.');
    },
  });
}

export function useUpdateExam(id: number) {
  const invalidate = useInvalidateExams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ExamInput) => examService.update(id, input),
    onSuccess: async (exam) => {
      queryClient.setQueryData(examKeys.detail(id), exam);
      await invalidate();
      toast.success('Exam updated', exam.name);
    },
  });
}

export function useDeleteExam() {
  const invalidate = useInvalidateExams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => examService.remove(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: examKeys.detail(id) });
      await invalidate();
      toast.success('Exam deleted');
    },
  });
}

export function usePublishSchedule(id: number) {
  const invalidate = useInvalidateExams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => examService.publishSchedule(id),
    onSuccess: async (exam) => {
      queryClient.setQueryData(examKeys.detail(id), exam);
      await invalidate();
      toast.success('Timetable published', `${exam.papers_count} papers are now visible.`);
    },
  });
}

// --- papers -----------------------------------------------------------------

/** A paper change moves the schedule, the marks sheets and the results. */
function useInvalidateExam(examId: number) {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: examKeys.detail(examId) }),
      queryClient.invalidateQueries({ queryKey: examKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: ['exams', 'results', examId] }),
      queryClient.invalidateQueries({ queryKey: examKeys.classes(examId) }),
    ]);
  };
}

export function useAddPaper(examId: number) {
  const invalidate = useInvalidateExam(examId);

  return useMutation({
    mutationFn: (input: PaperInput) => examService.addPaper(examId, input),
    onSuccess: async (paper) => {
      await invalidate();
      toast.success('Paper scheduled', `${paper.subject_name} — ${paper.class_name}`);
    },
  });
}

export function useUpdatePaper(examId: number, paperId: number) {
  const invalidate = useInvalidateExam(examId);

  return useMutation({
    mutationFn: (input: PaperInput) => examService.updatePaper(examId, paperId, input),
    onSuccess: async (paper) => {
      await invalidate();
      toast.success('Paper updated', `${paper.subject_name} — ${paper.class_name}`);
    },
  });
}

export function useRemovePaper(examId: number) {
  const invalidate = useInvalidateExam(examId);

  return useMutation({
    mutationFn: (paperId: number) => examService.removePaper(examId, paperId),
    onSuccess: async () => {
      await invalidate();
      toast.success('Paper removed from the schedule');
    },
  });
}

// --- marks ------------------------------------------------------------------

export function usePaperMarks(examId: number, paperId: number | undefined) {
  return useQuery({
    queryKey: examKeys.marks(examId, paperId ?? 0),
    queryFn: ({ signal }) => examService.paperMarks(examId, paperId!, signal),
    enabled: paperId !== undefined,
    // Several teachers may be entering marks for the same paper.
    staleTime: 0,
  });
}

export function useSaveMarks(examId: number, paperId: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateExam(examId);

  return useMutation({
    mutationFn: (marks: MarkInput[]) => examService.saveMarks(examId, paperId, marks),
    onSuccess: async (response, marks) => {
      // The response is the recomputed sheet, so it replaces the cache entry.
      queryClient.setQueryData(examKeys.marks(examId, paperId), response);
      await invalidate();

      const remaining = response.summary.total - response.summary.entered;
      toast.success(
        'Marks saved',
        `${marks.length} updated. ${remaining === 0 ? 'This paper is complete.' : `${remaining} still to enter.`}`,
      );
    },
  });
}

// --- results ----------------------------------------------------------------

export function useExamClasses(examId: number | undefined) {
  return useQuery({
    queryKey: examKeys.classes(examId ?? 0),
    queryFn: ({ signal }) => examService.examClasses(examId!, signal),
    enabled: examId !== undefined,
    staleTime: 5 * 60_000,
  });
}

export function useResults(examId: number, query: ResultsQuery, enabled = true) {
  return useQuery({
    queryKey: examKeys.results(examId, query),
    queryFn: ({ signal }) => examService.results(examId, query, signal),
    enabled: enabled && query.classId > 0,
  });
}

export function usePublishResults(examId: number) {
  const invalidate = useInvalidateExam(examId);

  return useMutation({
    mutationFn: (input: PublishResultsInput) => examService.publishResults(examId, input),
    onSuccess: async (results) => {
      await invalidate();
      toast.success(
        'Results published',
        `${results.summary.students} student${results.summary.students === 1 ? '' : 's'} in ${results.class_name} can now see their report card.`,
      );
    },
  });
}

export function useReportCard(examId: number, studentId: number | undefined) {
  return useQuery({
    queryKey: examKeys.reportCard(examId, studentId ?? 0),
    queryFn: ({ signal }) => examService.reportCard(examId, studentId!, signal),
    enabled: studentId !== undefined,
  });
}

/** These report their own outcome, so the global error toast is suppressed. */
export function useExportResults(examId: number) {
  return useMutation({
    mutationFn: ({ query, format }: { query: ResultsQuery; format: 'pdf' | 'excel' }) =>
      examService.exportResults(examId, query, format),
    onSuccess: (_result, { format }) =>
      toast.success(`${format === 'excel' ? 'Excel' : 'PDF'} export ready`, 'Check your downloads.'),
    onError: (error) => toast.error('Export failed', error.message),
    meta: { skipGlobalError: true },
  });
}

export function useDownloadReportCards(examId: number) {
  return useMutation({
    mutationFn: (query: ResultsQuery) => examService.downloadClassReportCards(examId, query),
    onSuccess: () => toast.success('Report cards ready', 'Check your downloads.'),
    onError: (error) => toast.error('Could not generate the report cards', error.message),
    meta: { skipGlobalError: true },
  });
}
