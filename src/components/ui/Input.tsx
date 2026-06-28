import * as React from 'react';
import { Input as BaseInput } from '@base-ui/react/input';
import { cn } from '@/lib/utils';

export type InputProps = React.ComponentPropsWithoutRef<typeof BaseInput>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <BaseInput
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
