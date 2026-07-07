import { cn } from '@/lib/utils';
import type { ComponentType } from 'react';

export type StatCardProps = {
  label: string;
  value: string | number;
  icon?: ComponentType<{ className?: string }>;
  description?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 shadow-card',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-body-sm text-muted-foreground">{label}</p>
          <p className="text-h3 text-foreground">{value}</p>
          {description && (
            <p className="text-body-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />}
      </div>
    </div>
  );
}
