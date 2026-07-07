import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type PageContentProps = {
  children: ReactNode;
  className?: string;
};

export function PageContent({ children, className }: PageContentProps) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}
