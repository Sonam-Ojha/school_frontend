import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';

import { SchoolGate } from '@/features/saas/SchoolContext';

import { SessionProvider } from './providers/SessionProvider';
import { createSchoolRouter } from './router';

/**
 * One school's application at `/<code>/…`: the school is looked up first,
 * then its session is restored, then its pages render.
 */
export default function SchoolApp({ code }: { code: string }) {
  const [router] = useState(() => createSchoolRouter(code));

  return (
    <SchoolGate code={code}>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </SchoolGate>
  );
}
