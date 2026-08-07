import { createContext, use } from 'react';

import type { StudentDetail } from '../types';

/**
 * Shares the student loaded by `StudentProfileLayout` with its tab bodies, so
 * each tab does not repeat the fetch, the loading state and the error branch.
 *
 * Lives apart from the layout component so Fast Refresh keeps working on both.
 */
export const StudentContext = createContext<StudentDetail | null>(null);

export function useStudentContext(): StudentDetail {
  const student = use(StudentContext);

  if (!student) {
    throw new Error('useStudentContext must be used inside StudentProfileLayout');
  }

  return student;
}
