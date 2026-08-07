import { createContext, use } from 'react';

import type { StaffMemberDetail } from '../types';

/**
 * Shares the record loaded by `StaffProfileLayout` with its tab bodies, so
 * each tab does not repeat the fetch, the loading state and the error branch.
 *
 * Lives apart from the layout component so Fast Refresh keeps working on both.
 */
export const StaffContext = createContext<StaffMemberDetail | null>(null);

export function useStaffContext(): StaffMemberDetail {
  const member = use(StaffContext);

  if (!member) {
    throw new Error('useStaffContext must be used inside StaffProfileLayout');
  }

  return member;
}
