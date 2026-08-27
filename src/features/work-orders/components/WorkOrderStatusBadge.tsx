import { cn } from '@/lib/utils';
import type { WorkOrderStatus } from '../types';

export const STATUS_STYLES: Record<WorkOrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  done: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Finalizada',
  cancelled: 'Cancelada',
};

export function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
