import { ThemeToggle } from '@/features/shell/components/ThemeToggle';
import * as React from 'react';
import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
}
