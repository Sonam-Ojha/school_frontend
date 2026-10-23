import type { UserLinks } from '@/types/auth';

/** Somebody on a roster that an account is linked to, by name. */
export interface LinkedPerson {
  id: number;
  name: string;
  /** Admission number or employee ID. */
  identifier: string | null;
  /** Class and section, or designation. */
  detail: string | null;
}

/**
 * A sign-in account.
 *
 * Separate from the people on the school's rolls: a student or teacher is a
 * record, a user is a login. Most students never sign in, and an accountant
 * needs a login without being on any roster.
 */
export interface UserAccount {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  /** Role slugs, e.g. `teacher`. */
  roles: string[];
  /** A deactivated account keeps its history but cannot sign in. */
  is_active: boolean;
  /** A shared demo account, entered with one click while demo sign-in is on. */
  is_demo?: boolean;
  /**
   * The roster records this account belongs to. A parent or student sees only
   * the students listed here, so an account with none sees nothing.
   */
  links: UserLinks;
  /** The same links by name, for display. */
  linked: { students: LinkedPerson[]; teacher: LinkedPerson | null; staff: LinkedPerson | null };
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

/** What the API accepts on create and update. */
export interface UserPayload {
  name: string;
  email: string;
  phone: string | null;
  roles: string[];
  is_active: boolean;
  /** Required on create. On update, sent only when a new one was typed. */
  password?: string;
  /** Left out entirely, the API matches the account to the rosters by email address. */
  student_ids?: number[];
  teacher_id?: number | null;
  staff_id?: number | null;
}
