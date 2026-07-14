import * as React from 'react';
import { Navigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import { isRouteAllowed } from '../lib/navigation';
import type { RoleName } from '../types';

type RouteGuardProps = {
  routePath: string;
  requiredRole?: RoleName;
  requiredRoles?: RoleName[];
  children: React.ReactNode;
};

export function RouteGuard({
  routePath,
  requiredRole,
  requiredRoles,
  children,
}: RouteGuardProps) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-muted-foreground">Cargando…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  if (!isRouteAllowed(user.role.name, routePath)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const requiredRolesList =
    requiredRoles ?? (requiredRole ? [requiredRole] : []);

  if (
    requiredRolesList.length > 0 &&
    !requiredRolesList.includes(user.role.name)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
