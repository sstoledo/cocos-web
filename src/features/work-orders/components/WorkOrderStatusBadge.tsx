import type { WorkOrderStatus } from '../types';

export const STATUS_STYLES: Record<WorkOrderStatus, string> = {
  pending: 'bg-warning text-warning-foreground',
  in_progress: 'bg-primary text-primary-foreground',
  done: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
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
      className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
