import type { WorkOrderPaymentStatus } from '../types';

export const PAYMENT_STATUS_STYLES: Record<WorkOrderPaymentStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  partial: 'bg-warning text-warning-foreground',
  paid: 'bg-success text-success-foreground',
};

export const PAYMENT_STATUS_LABELS: Record<WorkOrderPaymentStatus, string> = {
  pending: 'Pendiente',
  partial: 'Parcial',
  paid: 'Pagada',
};

export function WorkOrderPaymentStatusBadge({
  status,
}: {
  status: WorkOrderPaymentStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${PAYMENT_STATUS_STYLES[status]}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
