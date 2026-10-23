import { Link } from 'react-router-dom';

export default function PlatformNotFoundPage() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">No such page in the console</h1>
      <Link to="/dashboard" className="mt-4 text-sm font-medium text-brand-600 hover:underline">
        Back to the dashboard
      </Link>
    </div>
  );
}
