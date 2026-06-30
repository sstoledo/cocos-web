import * as React from 'react';
import { Navigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import { isRouteAllowed } from '../lib/navigation';

type RouteGuardProps = {
  routePath: string;
  children: React.ReactNode;
};

export function RouteGuard({ routePath, children }: RouteGuardProps) {
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

  if (!isRouteAllowed(user.role.name, routePath)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
