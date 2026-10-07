import { Button } from '@/components/ui/Button';
import { Dialog } from '@base-ui/react/dialog';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'default';
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  variant = 'danger',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg outline-none">
            <Dialog.Title className="text-lg font-semibold">
              {title}
            </Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {cancelLabel}
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'default'}
                onClick={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
