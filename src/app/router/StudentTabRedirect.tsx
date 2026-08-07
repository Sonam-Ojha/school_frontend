import { Navigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from './paths';

/** `/students/:id` has no body of its own — send it to the first tab. */
export function StudentTabRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={toPath(PATHS.studentOverview, { id: id ?? '' })} replace />;
}
