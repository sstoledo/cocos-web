import type { SaleStatus } from '../types';

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const SALE_STATUS_STYLES: Record<SaleStatus, string> = {
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${SALE_STATUS_STYLES[status]}`}
    >
      {SALE_STATUS_LABELS[status]}
    </span>
  );
}
