import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';
import type { Option } from '@/types/common';

import type {
  AddCopiesInput,
  BookInput,
  CategoryInput,
  CopyInput,
  FinePaymentInput,
  FineWaiverInput,
  IssueInput,
  RenewInput,
  ReturnInput,
} from '../schemas';
import { libraryService, type MemberSearchQuery } from '../services/libraryService';
import type { BookDetail, MemberType } from '../types';

export const bookKeys = createResourceKeys('library-books');
export const categoryKeys = createResourceKeys('library-categories');

export const libraryKeys = {
  all: ['library'] as const,
  summary: () => ['library', 'summary'] as const,
  loans: (params: ListQueryParams) => ['library', 'loans', params] as const,
  members: (query: MemberSearchQuery) => ['library', 'members', query] as const,
  member: (type: MemberType, id: number) => ['library', 'member', type, id] as const,
  lookup: (accessionNo: string) => ['library', 'lookup', accessionNo] as const,
};

/** The catalogue changes far less often than the loans do. */
const LOOKUP_STALE_TIME = 5 * 60_000;

/**
 * Any circulation write moves the catalogue's availability counts, a
 * member's borrowing headroom and the summary at once — so they all
 * invalidate together rather than each write listing what it happens to touch.
 */
function useInvalidateLibrary() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    await queryClient.invalidateQueries({ queryKey: bookKeys.all });
    await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
  };
}

// --- categories -------------------------------------------------------------

export function useCategories(params: ListQueryParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: ({ signal }) => libraryService.listCategories(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useCategoryOptions() {
  const query = useQuery({
    queryKey: categoryKeys.options(),
    queryFn: ({ signal }) => libraryService.categories(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const categories = useMemo(() => query.data ?? [], [query.data]);

  const categoryOptions = useMemo<Option<number>[]>(
    () =>
      categories
        .filter((category) => category.is_active)
        .map((category) => ({ label: `${category.name} (${category.code})`, value: category.id })),
    [categories],
  );

  return { ...query, categories, categoryOptions };
}

export function useCreateCategory() {
  const invalidate = useInvalidateLibrary();

  return useMutation({
    mutationFn: (input: CategoryInput) => libraryService.createCategory(input),
    onSuccess: async (category) => {
      await invalidate();
      toast.success('Category added', `Books can now be filed under ${category.name}.`);
    },
  });
}

export function useUpdateCategory(id: number) {
  const invalidate = useInvalidateLibrary();

  return useMutation({
    mutationFn: (input: CategoryInput) => libraryService.updateCategory(id, input),
    onSuccess: async () => {
      await invalidate();
      toast.success('Category updated');
    },
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateLibrary();

  return useMutation({
    mutationFn: (id: number) => libraryService.removeCategory(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Category removed');
    },
  });
}

// --- books ------------------------------------------------------------------

export function useBooks(params: ListQueryParams) {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: ({ signal }) => libraryService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useBook(id: number | string | undefined) {
  return useQuery({
    queryKey: bookKeys.detail(id ?? ''),
    queryFn: ({ signal }) => libraryService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

export function useLibrarySummary() {
  return useQuery({
    queryKey: libraryKeys.summary(),
    queryFn: ({ signal }) => libraryService.summary(signal),
    staleTime: 60_000,
  });
}

export function useCreateBook() {
  const invalidate = useInvalidateLibrary();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BookInput) => libraryService.create(input),
    onSuccess: async (book) => {
      queryClient.setQueryData(bookKeys.detail(book.id), book);
      await invalidate();
      toast.success('Book added', 'Add its copies to put it into circulation.');
    },
  });
}

export function useUpdateBook(id: number) {
  const invalidate = useInvalidateLibrary();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BookInput) => libraryService.update(id, input),
    onSuccess: async (book) => {
      queryClient.setQueryData(bookKeys.detail(book.id), book);
      await invalidate();
      toast.success('Book updated');
    },
  });
}

export function useDeleteBook() {
  const invalidate = useInvalidateLibrary();

  return useMutation({
    mutationFn: (id: number) => libraryService.remove(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Book removed');
    },
  });
}

// --- copies -----------------------------------------------------------------

/**
 * Copy writes all return the recomputed book.
 *
 * Availability counts are derived from the copies, so the server that changed
 * one sends back the totals — a client incrementing `available_copies` itself
 * would drift the first time a write half-succeeded.
 */
function useCopyMutation<TInput>(
  bookId: number,
  mutationFn: (input: TInput) => Promise<BookDetail>,
  message: string,
) {
  const invalidate = useInvalidateLibrary();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (book) => {
      queryClient.setQueryData(bookKeys.detail(bookId), book);
      await invalidate();
      toast.success(message);
    },
  });
}

export function useAddCopies(bookId: number) {
  return useCopyMutation<AddCopiesInput>(
    bookId,
    (input) => libraryService.addCopies(bookId, input),
    'Copies added',
  );
}

export function useUpdateCopy(bookId: number, copyId: number) {
  return useCopyMutation<CopyInput>(
    bookId,
    (input) => libraryService.updateCopy(bookId, copyId, input),
    'Copy updated',
  );
}

export function useRemoveCopy(bookId: number) {
  return useCopyMutation<number>(
    bookId,
    (copyId) => libraryService.removeCopy(bookId, copyId),
    'Copy removed',
  );
}

// --- circulation ------------------------------------------------------------

export function useLoans(params: ListQueryParams) {
  return useQuery({
    queryKey: libraryKeys.loans(params),
    queryFn: ({ signal }) => libraryService.listLoans(params, signal),
    placeholderData: (previous) => previous,
  });
}

/** Only fires once a barcode has actually been scanned or typed in full. */
export function useCopyLookup(accessionNo: string | null) {
  return useQuery({
    queryKey: libraryKeys.lookup(accessionNo ?? ''),
    queryFn: ({ signal }) => libraryService.lookupCopy(accessionNo!, signal),
    enabled: Boolean(accessionNo),
    retry: false,
    // A scan that finds nothing is an answer, not an error worth a toast.
    meta: { skipGlobalError: true },
  });
}

export function useMemberSearch(query: MemberSearchQuery, enabled: boolean) {
  return useQuery({
    queryKey: libraryKeys.members(query),
    queryFn: ({ signal }) => libraryService.searchMembers(query, signal),
    enabled,
  });
}

export function useMember(type: MemberType | null, id: number | null) {
  return useQuery({
    queryKey: libraryKeys.member(type ?? 'student', id ?? 0),
    queryFn: ({ signal }) => libraryService.member(type!, id!, signal),
    enabled: Boolean(type && id),
  });
}

export function useIssueBook() {
  const invalidate = useInvalidateLibrary();

  return useMutation({
    mutationFn: (input: IssueInput) => libraryService.issue(input),
    onSuccess: async (loan) => {
      await invalidate();
      toast.success('Book issued', `${loan.book_title} is due back on ${loan.due_on}.`);
    },
  });
}

export function useReturnBook() {
  const invalidate = useInvalidateLibrary();

  return useMutation({
    mutationFn: (input: ReturnInput) => libraryService.returnLoan(input),
    onSuccess: async (loan) => {
      await invalidate();
      toast.success(
        'Book returned',
        loan.fine_due > 0
          ? `A fine of ₹${loan.fine_due} is still outstanding.`
          : `${loan.book_title} is back on the shelf.`,
      );
    },
  });
}

export function useRenewLoan() {
  const invalidate = useInvalidateLibrary();

  return useMutation({
    mutationFn: (input: RenewInput) => libraryService.renew(input),
    onSuccess: async (loan) => {
      await invalidate();
      toast.success('Loan renewed', `Now due back on ${loan.due_on}.`);
    },
  });
}

// --- fines ------------------------------------------------------------------

export function usePayFine() {
  const invalidate = useInvalidateLibrary();

  return useMutation({
    mutationFn: (input: FinePaymentInput) => libraryService.payFine(input),
    onSuccess: async (loan) => {
      await invalidate();
      toast.success(
        'Fine collected',
        loan.fine_due > 0 ? `₹${loan.fine_due} still outstanding.` : 'Settled in full.',
      );
    },
  });
}

export function useWaiveFine() {
  const invalidate = useInvalidateLibrary();

  return useMutation({
    mutationFn: (input: FineWaiverInput) => libraryService.waiveFine(input),
    onSuccess: async () => {
      await invalidate();
      toast.success('Fine waived', 'The waiver is recorded against the loan.');
    },
  });
}

// --- printing and export ----------------------------------------------------

export function useDownloadLabels(bookId: number) {
  return useMutation({
    mutationFn: (copyIds: number[]) => libraryService.downloadLabels(bookId, copyIds),
    onError: (error: Error) => toast.error('Could not download the labels', error.message),
  });
}

export function useExportBooks() {
  return useMutation({
    mutationFn: ({ params, format }: { params: ListQueryParams; format: 'pdf' | 'excel' }) =>
      libraryService.exportBooks(params, format),
    onError: (error: Error) => toast.error('Could not export the catalogue', error.message),
  });
}

export function useExportLoans() {
  return useMutation({
    mutationFn: ({ params, format }: { params: ListQueryParams; format: 'pdf' | 'excel' }) =>
      libraryService.exportLoans(params, format),
    onError: (error: Error) => toast.error('Could not export the loans', error.message),
  });
}
