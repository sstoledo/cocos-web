import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type PageTitleProps = {
  children: ReactNode;
  className?: string;
};

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1
      className={cn(
        'font-display text-[length:--font-h1-size] font-bold leading-[--line-height-h1] tracking-[--letter-spacing-h1] text-foreground',
        className
      )}
    >
      {children}
    </h1>
  );
}
