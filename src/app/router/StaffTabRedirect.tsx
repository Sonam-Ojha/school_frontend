import { Navigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from './paths';

/** `/staff/:id` has no body of its own — send it to the first tab. */
export function StaffTabRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={toPath(PATHS.staffOverview, { id: id ?? '' })} replace />;
}
