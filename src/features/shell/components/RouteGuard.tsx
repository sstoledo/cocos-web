import * as React from 'react';
import { Navigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import { isRouteAllowed } from '../lib/navigation';
import type { RoleName } from '../types';

type RouteGuardProps = {
  routePath: string;
  requiredRole?: RoleName;
  children: React.ReactNode;
};

export function RouteGuard({
  routePath,
  requiredRole,
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

  if (requiredRole && user.role.name !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
