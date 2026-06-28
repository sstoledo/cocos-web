import { ThemeToggle } from '@/features/shell/components/ThemeToggle';
import { Outlet } from 'react-router';

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Cocos</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
