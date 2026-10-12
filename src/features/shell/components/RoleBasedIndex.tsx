import { Navigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import { getDefaultRouteForRole } from '../lib/defaultRoute';

export function RoleBasedIndex() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-muted-foreground">Cargando…</span>
      </div>
    );
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role.name)} replace />;
}
