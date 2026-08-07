import { ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <ShieldX className="size-6" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-semibold text-red-600">403</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        You do not have permission to view this page. Contact an administrator if you believe this
        is a mistake.
      </p>

      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button onClick={() => navigate(PATHS.dashboard, { replace: true })}>Dashboard</Button>
      </div>
    </div>
  );
}
