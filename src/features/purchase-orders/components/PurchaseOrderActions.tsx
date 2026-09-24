import { Button } from '@/components/ui/Button';
import { useUser } from '@/features/shell/hooks/useUser';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link } from 'react-router';
import { useCancelPurchaseOrder } from '../hooks/use-cancel-purchase-order';
import { useOrderPurchaseOrder } from '../hooks/use-order-purchase-order';
import { getPurchaseOrderErrorMessage } from '../lib/purchase-order-error-messages';
import type { PurchaseOrder } from '../types';

const WRITE_ROLES = ['Admin', 'Purchasing'];
const RECEIVE_ROLES = ['Admin', 'Purchasing', 'Warehouse'];

export function PurchaseOrderActions({
  purchaseOrder,
}: {
  purchaseOrder: PurchaseOrder;
}) {
  const { user } = useUser();
  const order = useOrderPurchaseOrder();
  const cancel = useCancelPurchaseOrder();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleName = user?.role?.name ?? '';
  const canWrite = WRITE_ROLES.includes(roleName);
  const canReceive = RECEIVE_ROLES.includes(roleName);

  const showOrder = canWrite && purchaseOrder.status === 'draft';
  const showCancel =
    canWrite && ['draft', 'ordered'].includes(purchaseOrder.status);
  const showEdit = canWrite && purchaseOrder.status === 'draft';
  const showReceive =
    canReceive &&
    ['ordered', 'partially_received'].includes(purchaseOrder.status);

  if (!showOrder && !showCancel && !showEdit && !showReceive) {
    return null;
  }

  function handleOrder() {
    // window.confirm naming the order (SaleCancelAction precedent); a
    // dismissed confirm MUST NOT fire the mutation.
    if (
      !window.confirm(
        `¿Confirmar la orden ${purchaseOrder.purchaseOrderNumber}? Se notificará al proveedor.`
      )
    ) {
      return;
    }

    setErrorMessage(null);
    order.mutate(purchaseOrder.id, {
      onError: (error) => {
        setErrorMessage(getPurchaseOrderErrorMessage(error));
      },
    });
  }

  function handleCancel() {
    if (
      !window.confirm(
        `¿Cancelar la orden ${purchaseOrder.purchaseOrderNumber}? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setErrorMessage(null);
    cancel.mutate(purchaseOrder.id, {
      onError: (error) => {
        setErrorMessage(getPurchaseOrderErrorMessage(error));
      },
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showEdit && (
        <Link
          to={`/purchase-orders/${purchaseOrder.id}/edit`}
          className={cn(
            'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
            'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Editar
        </Link>
      )}
      {showReceive && (
        <Link
          to={`/purchase-orders/${purchaseOrder.id}/receive`}
          className={cn(
            'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
            'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Registrar recepción
        </Link>
      )}
      {showOrder && (
        <Button
          type="button"
          variant="outline"
          disabled={order.isPending}
          onClick={handleOrder}
        >
          Confirmar orden
        </Button>
      )}
      {showCancel && (
        <Button
          type="button"
          variant="outline"
          disabled={cancel.isPending}
          onClick={handleCancel}
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          Cancelar orden
        </Button>
      )}
      {errorMessage && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}
