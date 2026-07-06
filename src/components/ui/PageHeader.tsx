import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type PageHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6 space-y-2', className)}>{children}</header>
  );
}
