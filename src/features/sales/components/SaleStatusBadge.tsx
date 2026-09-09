import { cn } from '@/lib/utils';
import type { SaleStatus } from '../types';

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const SALE_STATUS_STYLES: Record<SaleStatus, string> = {
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        SALE_STATUS_STYLES[status]
      )}
    >
      {SALE_STATUS_LABELS[status]}
    </span>
  );
}
