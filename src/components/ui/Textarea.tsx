import { cn } from '@/lib/utils';
import { IconAlertCircle } from '@tabler/icons-react';
import * as React from 'react';

export type TextareaProps = React.ComponentPropsWithoutRef<'textarea'> & {
  label?: string;
  error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium text-foreground',
              props.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          {...props}
        />
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
Textarea.displayName = 'Textarea';
