import { Navigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from './paths';

/** `/teachers/:id` has no body of its own — send it to the first tab. */
export function TeacherTabRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={toPath(PATHS.teacherOverview, { id: id ?? '' })} replace />;
}
