import { createContext, use } from 'react';

import type { TeacherDetail } from '../types';

/**
 * Shares the teacher loaded by `TeacherProfileLayout` with its tab bodies, so
 * each tab does not repeat the fetch, the loading state and the error branch.
 *
 * Lives apart from the layout component so Fast Refresh keeps working on both.
 */
export const TeacherContext = createContext<TeacherDetail | null>(null);

export function useTeacherContext(): TeacherDetail {
  const teacher = use(TeacherContext);

  if (!teacher) {
    throw new Error('useTeacherContext must be used inside TeacherProfileLayout');
  }

  return teacher;
}
