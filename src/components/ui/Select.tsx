import { cn } from '@/lib/utils';
import { IconAlertCircle } from '@tabler/icons-react';
import * as React from 'react';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = React.ComponentPropsWithoutRef<'select'> & {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'block text-sm font-medium text-foreground',
              props.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'flex h-10 w-full appearance-none rounded-md border border-border bg-card px-3 py-2',
            'text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={errorId}
            className="flex items-center gap-1 text-sm text-destructive"
          >
            <IconAlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
