import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { Drawer } from '../components/Drawer';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useUser } from '../hooks/useUser';
import { getPageTitle } from '../lib/pageTitles';

export function Layout() {
  const { user, isLoading } = useUser();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <span className="text-muted-foreground">Cargando…</span>
      </div>
    );
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  const title = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        role={user.role.name}
        userName={user.name}
        userEmail={user.email}
        className="hidden lg:flex"
      />
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Sidebar
          role={user.role.name}
          userName={user.name}
          userEmail={user.email}
        />
      </Drawer>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
