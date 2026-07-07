import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type PageTitleProps = {
  children: ReactNode;
  className?: string;
};

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1 className={cn('font-sans text-h2 text-foreground', className)}>
      {children}
    </h1>
  );
}
