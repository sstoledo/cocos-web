import { cn } from '@/lib/utils';
import { Dialog } from '@base-ui/react/dialog';
import { IconX } from '@tabler/icons-react';
import type { ReactNode } from 'react';

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  onOpenChange,
  children,
  className,
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          data-testid="drawer-backdrop"
          className="fixed inset-0 z-40 bg-black/50"
        />
        <Dialog.Viewport className="fixed inset-0 z-40 flex">
          <Dialog.Popup
            aria-label="Navegación principal"
            className={cn(
              'relative h-full w-[260px] bg-card shadow-lg outline-none',
              className
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center justify-end border-b px-4">
                <Dialog.Close
                  type="button"
                  aria-label="Cerrar menú"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <IconX className="h-5 w-5" />
                </Dialog.Close>
              </div>
              {children}
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
