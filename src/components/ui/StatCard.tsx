import { cn } from '@/lib/utils';
import type { ComponentType } from 'react';

export type StatCardProps = {
  label: string;
  value?: string | number;
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
      className={cn('flex flex-col gap-3 rounded-xl bg-card p-4', className)}
    >
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-body font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-body-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {value !== undefined && value !== '—' && (
        <p className="text-h3 text-foreground">{value}</p>
      )}
    </div>
  );
}
