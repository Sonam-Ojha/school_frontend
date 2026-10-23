import { Link } from 'react-router-dom';

import { WebsiteShell } from '../components/WebsiteShell';

export default function WebsiteNotFoundPage() {
  return (
    <WebsiteShell>
      <div className="py-10 text-center">
        <p className="text-sm font-semibold text-brand-600">404</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          There is nothing at this address. If you were looking for your school, sign in with its code.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/login"
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Find my school
          </Link>
          <Link
            to="/"
            className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
        </div>
      </div>
    </WebsiteShell>
  );
}
