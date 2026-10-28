import type { PurchaseOrderStatus } from '../types';

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> =
  {
    draft: 'Borrador',
    ordered: 'Ordenada',
    partially_received: 'Recibida parcial',
    received: 'Recibida',
    cancelled: 'Cancelada',
  };

const PURCHASE_ORDER_STATUS_STYLES: Record<PurchaseOrderStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  ordered: 'bg-primary text-primary-foreground',
  partially_received: 'bg-warning text-warning-foreground',
  received: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

export function PurchaseOrderStatusBadge({
  status,
}: {
  status: PurchaseOrderStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${PURCHASE_ORDER_STATUS_STYLES[status]}`}
    >
      {PURCHASE_ORDER_STATUS_LABELS[status]}
    </span>
  );
}
