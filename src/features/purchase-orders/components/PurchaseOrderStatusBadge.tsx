import { cn } from '@/lib/utils';
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
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  ordered: 'bg-blue-100 text-blue-800 border-blue-200',
  partially_received: 'bg-amber-100 text-amber-800 border-amber-200',
  received: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export function PurchaseOrderStatusBadge({
  status,
}: {
  status: PurchaseOrderStatus;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        PURCHASE_ORDER_STATUS_STYLES[status]
      )}
    >
      {PURCHASE_ORDER_STATUS_LABELS[status]}
    </span>
  );
}
