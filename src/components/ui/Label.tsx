import { cn } from '@/lib/utils';
import * as React from 'react';

export type LabelProps = React.ComponentPropsWithoutRef<'label'> & {
  disabled?: boolean;
  error?: boolean;
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, disabled, error, ...props }, ref) => {
    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: Label is a reusable primitive intended to be associated with a control via htmlFor.
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium text-foreground',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'text-destructive',
          className
        )}
        {...props}
        data-disabled={disabled}
        data-error={error}
      />
    );
  }
);
Label.displayName = 'Label';
