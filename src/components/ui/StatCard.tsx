import { cn } from '@/lib/utils';
import { IconChevronRight } from '@tabler/icons-react';
import type { ComponentType } from 'react';

export type StatCardProps = {
  label: string;
  value?: string | number;
  icon?: ComponentType<{ className?: string }>;
  description?: string;
  showNavigation?: boolean;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  showNavigation = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-stat',
        className
      )}
    >
      {(Icon || showNavigation) && (
        <div className="flex items-center justify-between">
          {Icon ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <span />
          )}
          {showNavigation && (
            <IconChevronRight
              data-testid="stat-card-navigation"
              aria-hidden="true"
              className="h-[18px] w-[18px] text-muted-foreground"
            />
          )}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-body-sm font-medium text-muted-foreground">
          {label}
        </p>
        {description && (
          <p className="text-body-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {value !== undefined && value !== '—' && (
        <p className="font-display text-h1 font-semibold leading-none text-foreground">
          {value}
        </p>
      )}
    </div>
  );
}
