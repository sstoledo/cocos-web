import { Navigate, Outlet } from 'react-router';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useUser } from '../hooks/useUser';

export function Layout() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
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

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar role={user.role.name} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header name={user.name} email={user.email} />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
