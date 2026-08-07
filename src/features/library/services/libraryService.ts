import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type {
  ApiResource,
  CollectionResponse,
  ListQueryParams,
  PaginatedResponse,
} from '@/types/api';

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
import type {
  Book,
  BookCategory,
  BookDetail,
  CopyLookup,
  LibraryMember,
  LibrarySummary,
  Loan,
  MemberType,
} from '../types';

const bookCrud = createCrudService<Book>('/library/books');
const categoryCrud = createCrudService<BookCategory>('/library/categories');

const nullable = (value: string): string | null => value.trim() || null;

/** Blank optional numbers are "not recorded", not zero. */
const optionalNumber = (value: string): number | null =>
  value.trim() === '' ? null : Number(value);

const toCategoryPayload = (input: CategoryInput) => ({
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),
  description: nullable(input.description),
  is_active: input.is_active,
});

const toBookPayload = (input: BookInput) => ({
  title: input.title.trim(),
  subtitle: nullable(input.subtitle),
  author: input.author.trim(),
  // Separators are how people type an ISBN, not part of it.
  isbn: input.isbn.replace(/[\s-]/g, '').toUpperCase() || null,
  category_id: input.category_id,
  publisher: nullable(input.publisher),
  edition: nullable(input.edition),
  publication_year: optionalNumber(input.publication_year),
  language: input.language,
  pages: optionalNumber(input.pages),
  price: input.price,
  shelf_no: nullable(input.shelf_no),
  description: nullable(input.description),
});

export interface MemberSearchQuery {
  search: string;
  type?: MemberType | null;
}

export const libraryService = {
  // --- categories ---

  listCategories: categoryCrud.list,

  async categories(signal?: AbortSignal): Promise<BookCategory[]> {
    const { data } = await http.get<CollectionResponse<BookCategory>>('/library/categories', {
      params: { per_page: 'all' },
      signal,
    });
    return data.data;
  },

  async createCategory(input: CategoryInput): Promise<BookCategory> {
    const { data } = await http.post<ApiResource<BookCategory>>(
      '/library/categories',
      toCategoryPayload(input),
    );
    return data.data;
  },

  async updateCategory(id: number, input: CategoryInput): Promise<BookCategory> {
    const { data } = await http.put<ApiResource<BookCategory>>(
      `/library/categories/${id}`,
      toCategoryPayload(input),
    );
    return data.data;
  },

  removeCategory: categoryCrud.remove,

  // --- books ---

  list: bookCrud.list,
  remove: bookCrud.remove,

  async show(id: number | string, signal?: AbortSignal): Promise<BookDetail> {
    const { data } = await http.get<ApiResource<BookDetail>>(`/library/books/${id}`, { signal });
    return data.data;
  },

  async create(input: BookInput): Promise<BookDetail> {
    const { data } = await http.post<ApiResource<BookDetail>>(
      '/library/books',
      toBookPayload(input),
    );
    return data.data;
  },

  async update(id: number, input: BookInput): Promise<BookDetail> {
    const { data } = await http.put<ApiResource<BookDetail>>(
      `/library/books/${id}`,
      toBookPayload(input),
    );
    return data.data;
  },

  async summary(signal?: AbortSignal): Promise<LibrarySummary> {
    const { data } = await http.get<ApiResource<LibrarySummary>>('/library/summary', { signal });
    return data.data;
  },

  // --- copies ---

  /**
   * Add a run of copies.
   *
   * Accession numbers are minted by the API, never sent — uniqueness across
   * the whole collection is not something a form can promise.
   */
  async addCopies(bookId: number, input: AddCopiesInput): Promise<BookDetail> {
    const { data } = await http.post<ApiResource<BookDetail>>(
      `/library/books/${bookId}/copies`,
      {
        quantity: input.quantity,
        condition: input.condition,
        acquired_on: input.acquired_on,
        price: input.price,
        shelf_no: nullable(input.shelf_no),
        remarks: nullable(input.remarks),
      },
    );
    return data.data;
  },

  async updateCopy(bookId: number, copyId: number, input: CopyInput): Promise<BookDetail> {
    const { data } = await http.put<ApiResource<BookDetail>>(
      `/library/books/${bookId}/copies/${copyId}`,
      {
        accession_no: input.accession_no.trim().toUpperCase(),
        status: input.status,
        condition: input.condition,
        acquired_on: input.acquired_on,
        price: input.price,
        shelf_no: nullable(input.shelf_no),
        remarks: nullable(input.remarks),
      },
    );
    return data.data;
  },

  async removeCopy(bookId: number, copyId: number): Promise<BookDetail> {
    const { data } = await http.delete<ApiResource<BookDetail>>(
      `/library/books/${bookId}/copies/${copyId}`,
    );
    return data.data;
  },

  /**
   * What a scanned barcode is.
   *
   * One endpoint for both desks: the issue desk wants a copy that is free,
   * the return desk wants the loan against it, and both start from the same
   * scan. Two endpoints would mean two answers to "what is this book doing".
   */
  async lookupCopy(accessionNo: string, signal?: AbortSignal): Promise<CopyLookup> {
    const { data } = await http.get<ApiResource<CopyLookup>>('/library/copies/lookup', {
      params: { accession_no: accessionNo.trim().toUpperCase() },
      signal,
    });
    return data.data;
  },

  // --- members ---

  async searchMembers(query: MemberSearchQuery, signal?: AbortSignal): Promise<LibraryMember[]> {
    const { data } = await http.get<CollectionResponse<LibraryMember>>('/library/members', {
      params: { search: query.search, ...(query.type ? { type: query.type } : {}) },
      signal,
    });
    return data.data;
  },

  async member(
    type: MemberType,
    id: number,
    signal?: AbortSignal,
  ): Promise<{ member: LibraryMember; loans: Loan[] }> {
    const { data } = await http.get<ApiResource<{ member: LibraryMember; loans: Loan[] }>>(
      `/library/members/${type}/${id}`,
      { signal },
    );
    return data.data;
  },

  // --- circulation ---

  async listLoans(
    params: ListQueryParams = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<Loan>> {
    const { data } = await http.get<PaginatedResponse<Loan>>('/library/loans', { params, signal });
    return data;
  },

  async issue(input: IssueInput): Promise<Loan> {
    const { data } = await http.post<ApiResource<Loan>>('/library/loans', {
      copy_id: input.copy_id,
      member_type: input.member_type,
      member_id: input.member_id,
      due_on: input.due_on,
      remarks: nullable(input.remarks),
    });
    return data.data;
  },

  async returnLoan(input: ReturnInput): Promise<Loan> {
    const { data } = await http.post<ApiResource<Loan>>(`/library/loans/${input.loan_id}/return`, {
      condition: input.condition,
      collect_fine: input.collect_fine,
      remarks: nullable(input.remarks),
    });
    return data.data;
  },

  async renew(input: RenewInput): Promise<Loan> {
    const { data } = await http.post<ApiResource<Loan>>(`/library/loans/${input.loan_id}/renew`, {
      remarks: nullable(input.remarks),
    });
    return data.data;
  },

  // --- fines ---

  async payFine(input: FinePaymentInput): Promise<Loan> {
    const { data } = await http.post<ApiResource<Loan>>(
      `/library/loans/${input.loan_id}/fine/pay`,
      { amount: input.amount, remarks: nullable(input.remarks) },
    );
    return data.data;
  },

  async waiveFine(input: FineWaiverInput): Promise<Loan> {
    const { data } = await http.post<ApiResource<Loan>>(
      `/library/loans/${input.loan_id}/fine/waive`,
      { reason: input.reason.trim() },
    );
    return data.data;
  },

  // --- printing and export ---

  /** Barcode labels for a run of copies, as the print room would want them. */
  async downloadLabels(bookId: number, copyIds: number[]): Promise<void> {
    await downloadFile(
      `/library/books/${bookId}/labels`,
      timestampedFilename(`barcode-labels-book-${bookId}`, 'pdf'),
      { params: { copy_ids: copyIds.join(',') } },
    );
  },

  async exportBooks(params: ListQueryParams, format: 'pdf' | 'excel'): Promise<void> {
    await downloadFile(
      '/library/books/export',
      timestampedFilename('library-catalogue', format === 'excel' ? 'xlsx' : 'pdf'),
      { params: { ...params, format } },
    );
  },

  async exportLoans(params: ListQueryParams, format: 'pdf' | 'excel'): Promise<void> {
    await downloadFile(
      '/library/loans/export',
      timestampedFilename('library-loans', format === 'excel' ? 'xlsx' : 'pdf'),
      { params: { ...params, format } },
    );
  },
};

export type { ListQueryParams };
