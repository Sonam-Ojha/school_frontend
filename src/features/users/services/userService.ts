import { createCrudService } from '@/lib/createCrudService';

import type { UserAccount, UserPayload } from '../types';

const base = createCrudService<UserAccount, UserPayload>('/users');

/** What the form holds once role ids have been resolved to slugs. */
export interface UserWrite {
  name: string;
  email: string;
  phone: string;
  roles: string[];
  is_active: boolean;
  password: string;
  student_ids: number[];
  teacher_id: number | null;
  staff_id: number | null;
  /**
   * False on a new account whose links were left untouched: they are then
   * not sent, and the API matches the account to the rosters by email.
   */
  sendLinks: boolean;
}

/** Emails are case-insensitive identifiers; an untouched password is not sent at all. */
const toPayload = (input: UserWrite): UserPayload => ({
  name: input.name.trim(),
  email: input.email.trim().toLowerCase(),
  phone: input.phone.trim() || null,
  roles: input.roles,
  is_active: input.is_active,
  ...(input.password ? { password: input.password } : {}),
  ...(input.sendLinks
    ? { student_ids: input.student_ids, teacher_id: input.teacher_id, staff_id: input.staff_id }
    : {}),
});

/** User account I/O. Hooks call this; components never do. */
export const userService = {
  list: base.list,
  remove: base.remove,
  create: (input: UserWrite) => base.create(toPayload(input)),
  update: (id: number | string, input: UserWrite) => base.update(id, toPayload(input)),
};
