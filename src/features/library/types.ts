/**
 * The library.
 *
 * The distinction the whole module rests on: a **book** is a title, a **copy**
 * is a physical object on a shelf. A library owns five copies of one book,
 * each with its own accession number, its own barcode and its own condition —
 * and a loan is against a copy, never against a title. Conflating the two is
 * how a system ends up unable to say which of the five is missing.
 *
 * Members are not a table of their own: students and teachers already exist,
 * and a library card that duplicated their names would be one more place for
 * them to go stale. The loan carries a `member_type` discriminator, the same
 * shape the attendance module uses over its three populations.
 */

export interface BookCategory {
  id: number;
  name: string;
  /** Short shelving prefix — `SCI`, `LIT`. Also the accession-number stem. */
  code: string;
  description: string | null;
  is_active: boolean;
  /** Titles filed under it — computed by the API. A delete guard. */
  books_count: number;
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  subtitle: string | null;
  author: string;
  /** ISBN-10 or ISBN-13, stored without separators. */
  isbn: string | null;
  category_id: number;
  category_name: string;
  publisher: string | null;
  edition: string | null;
  publication_year: number | null;
  language: string;
  pages: number | null;
  /** Replacement cost, and the ceiling on any overdue fine. */
  price: number;
  /** Where it physically lives — `Rack 4, Shelf B`. */
  shelf_no: string | null;
  description: string | null;

  /** All computed from the copies, never stored alongside them. */
  total_copies: number;
  available_copies: number;
  issued_copies: number;
  created_at: string;
  updated_at: string;
}

/** `GET /library/books/{id}` — adds the physical copies. */
export interface BookDetail extends Book {
  copies: BookCopy[];
}

/**
 * `available` is on the shelf; `issued` is out on loan; `reserved` is held for
 * somebody; `lost` and `damaged` are still owned but not lendable;
 * `withdrawn` has left the collection but is kept for the audit trail.
 */
export type CopyStatus = 'available' | 'issued' | 'reserved' | 'lost' | 'damaged' | 'withdrawn';

export type CopyCondition = 'new' | 'good' | 'fair' | 'poor';

/** One physical object, and the thing a barcode is stuck to. */
export interface BookCopy {
  id: number;
  book_id: number;
  book_title: string;
  /** Unique across the whole library — this is what the barcode encodes. */
  accession_no: string;
  status: CopyStatus;
  condition: CopyCondition;
  acquired_on: string;
  /** What this copy cost, which may differ from the title's current price. */
  price: number;
  shelf_no: string | null;
  remarks: string | null;
  /** Who has it, when it is due back. Null unless the status is `issued`. */
  current_loan: {
    loan_id: number;
    member_name: string;
    due_on: string;
    is_overdue: boolean;
  } | null;
}

export type MemberType = 'student' | 'teacher';

export type LoanStatus = 'issued' | 'returned' | 'overdue' | 'lost';

/**
 * A borrower, assembled from the student or teacher record.
 *
 * The borrowing limit and the block reason come from the API rather than
 * being worked out on screen: whether somebody may take another book is a
 * lending policy, and a policy the client could disagree with is not a policy.
 */
export interface LibraryMember {
  member_type: MemberType;
  member_id: number;
  name: string;
  /** Admission number for a student, employee id for a teacher. */
  identifier: string;
  photo_url: string | null;
  /** Class and section, or designation — whichever the roster carries. */
  detail: string | null;

  active_loans: number;
  overdue_loans: number;
  outstanding_fine: number;
  borrow_limit: number;
  can_borrow: boolean;
  /** Why not, when `can_borrow` is false. Null otherwise. */
  blocked_reason: string | null;
}

export interface Loan {
  id: number;
  copy_id: number;
  accession_no: string;
  book_id: number;
  book_title: string;
  book_author: string;

  member_type: MemberType;
  member_id: number;
  member_name: string;
  member_identifier: string;

  issued_on: string;
  due_on: string;
  returned_on: string | null;
  status: LoanStatus;
  /** Times the due date has been pushed out. Capped by the lending policy. */
  renewals: number;

  /**
   * Days past the due date. Live while the book is out, frozen at return —
   * a returned loan's overdue count must not keep climbing.
   */
  days_overdue: number;
  /**
   * Accrued while out, frozen on return. A receipt that said ₹40 yesterday
   * must still say ₹40 today.
   */
  fine_amount: number;
  fine_paid: number;
  fine_waived: number;
  /** `fine_amount - fine_paid - fine_waived`. Computed by the API. */
  fine_due: number;

  issued_by: string | null;
  received_by: string | null;
  remarks: string | null;
}

/** The circulation desk's answer to a scanned barcode. */
export interface CopyLookup {
  copy: BookCopy;
  book: Book;
  /** The open loan on this copy, for a return. Null when it is on the shelf. */
  loan: Loan | null;
}

export interface LibrarySummary {
  total_books: number;
  total_copies: number;
  available_copies: number;
  issued_copies: number;
  overdue_loans: number;
  outstanding_fines: number;
}
