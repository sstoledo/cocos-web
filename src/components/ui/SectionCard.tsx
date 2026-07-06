import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type SectionCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-border bg-card p-6 shadow-card',
        className
      )}
    >
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
