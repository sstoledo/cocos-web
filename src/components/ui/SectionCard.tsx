import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type SectionCardProps = {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  children,
  actions,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-border bg-card p-6 shadow-card',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-h4 text-foreground">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
