import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useUser } from '@/features/shell/hooks/useUser';
import { ApiError } from '@/lib/api-error';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useCancelSale } from '../hooks/use-cancel-sale';
import { getSalesErrorMessage } from '../lib/sales-error-messages';
import type { Sale } from '../types';

const CANCEL_ROLES = ['Admin', 'Reception'];

export function SaleCancelAction({ sale }: { sale: Sale }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const cancel = useCancelSale();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canCancel =
    sale.status === 'completed' &&
    CANCEL_ROLES.includes(user?.role?.name ?? '');

  if (!canCancel) {
    return null;
  }

  function handleConfirm() {
    // Dialog dismiss MUST NOT fire the mutation (SL-F12).
    setErrorMessage(null);
    cancel.mutate(sale.id, {
      onError: (error) => {
        // 409: someone else cancelled first — re-fetch so the badge/list
        // reflect the true state, then surface the mapped copy (SL-F15).
        if (
          error instanceof ApiError &&
          error.errorCode === 'SALE_ALREADY_CANCELLED'
        ) {
          queryClient.invalidateQueries({ queryKey: ['sale', sale.id] });
          queryClient.invalidateQueries({ queryKey: ['sales'] });
        }
        setErrorMessage(getSalesErrorMessage(error, { action: 'cancel' }));
      },
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={cancel.isPending}
        onClick={() => setConfirmOpen(true)}
        className="border-destructive/50 text-destructive hover:bg-destructive/10"
      >
        Cancelar venta
      </Button>
      {errorMessage && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancelar venta"
        description={`¿Cancelar la venta ${sale.saleNumber}? Esta acción no se puede deshacer.`}
        confirmLabel="Cancelar venta"
        onConfirm={handleConfirm}
        variant="danger"
      />
    </div>
  );
}
