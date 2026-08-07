/** Public surface of the library module. */

export { AddCopiesModal } from './components/AddCopiesModal';
export { BarcodeLabelSheet } from './components/BarcodeLabelSheet';
export { BarcodeScanInput } from './components/BarcodeScanInput';
export { BookFormModal } from './components/BookFormModal';
export { CategoryFormModal } from './components/CategoryFormModal';
export { FineModal } from './components/FineModal';
export { LibraryStats } from './components/LibraryStats';
export { MemberCard } from './components/MemberCard';
export { ReturnModal } from './components/ReturnModal';
export { buildBookColumns } from './components/bookColumns';
export { buildLoanColumns } from './components/loanColumns';

export {
  BORROW_LIMITS,
  COPY_CONDITION_LABELS,
  COPY_CONDITION_OPTIONS,
  COPY_STATUS_LABELS,
  COPY_STATUS_OPTIONS,
  COPY_STATUS_TONES,
  FINE_GRACE_DAYS,
  FINE_PER_DAY,
  LABELS_PER_SHEET,
  LANGUAGE_OPTIONS,
  LIBRARY_PERMISSIONS,
  LOAN_DAYS,
  LOAN_STATUS_LABELS,
  LOAN_STATUS_OPTIONS,
  LOAN_STATUS_TONES,
  MAX_COPIES_PER_BATCH,
  MAX_RENEWALS,
  MEMBER_TYPE_LABELS,
  MEMBER_TYPE_OPTIONS,
  RENEWAL_DAYS,
  fineFor,
} from './constants';

export {
  bookKeys,
  categoryKeys,
  libraryKeys,
  useAddCopies,
  useBook,
  useBooks,
  useCategories,
  useCategoryOptions,
  useCopyLookup,
  useCreateBook,
  useCreateCategory,
  useDeleteBook,
  useDeleteCategory,
  useDownloadLabels,
  useExportBooks,
  useExportLoans,
  useIssueBook,
  useLibrarySummary,
  useLoans,
  useMember,
  useMemberSearch,
  usePayFine,
  useRemoveCopy,
  useRenewLoan,
  useReturnBook,
  useUpdateBook,
  useUpdateCategory,
  useUpdateCopy,
  useWaiveFine,
} from './hooks/useLibrary';

export { libraryService, type MemberSearchQuery } from './services/libraryService';

export {
  addCopiesSchema,
  bookSchema,
  categorySchema,
  copySchema,
  finePaymentSchema,
  fineWaiverSchema,
  issueSchema,
  renewSchema,
  returnSchema,
  type AddCopiesInput,
  type BookInput,
  type CategoryInput,
  type CopyInput,
  type FinePaymentInput,
  type FineWaiverInput,
  type IssueInput,
  type RenewInput,
  type ReturnInput,
} from './schemas';

export type {
  Book,
  BookCategory,
  BookCopy,
  BookDetail,
  CopyCondition,
  CopyLookup,
  CopyStatus,
  LibraryMember,
  LibrarySummary,
  Loan,
  LoanStatus,
  MemberType,
} from './types';
