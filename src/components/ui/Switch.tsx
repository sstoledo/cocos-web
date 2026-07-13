import { cn } from '@/lib/utils';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import * as React from 'react';

export type SwitchProps = React.ComponentPropsWithoutRef<
  typeof BaseSwitch.Root
> & {
  label?: string;
};

export const Switch = React.forwardRef<HTMLElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;

    return (
      <div className="flex items-center gap-3">
        <BaseSwitch.Root
          ref={ref}
          id={switchId}
          className={cn(
            'relative h-6 w-11 rounded-full bg-muted transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'data-[checked=true]:bg-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
            className
          )}
          {...props}
        >
          <BaseSwitch.Thumb
            className={cn(
              'block h-5 w-5 rounded-full bg-background shadow transition-transform',
              'data-[checked=true]:translate-x-5 data-[checked=true]:bg-primary-foreground',
              'data-[unchecked]:translate-x-0.5'
            )}
          />
        </BaseSwitch.Root>
        {label && (
          <label
            htmlFor={switchId}
            className={cn(
              'text-sm font-medium text-foreground',
              props.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Switch.displayName = 'Switch';
