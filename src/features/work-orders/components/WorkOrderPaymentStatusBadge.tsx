import { cn } from '@/lib/utils';
import type { WorkOrderPaymentStatus } from '../types';

export const PAYMENT_STATUS_STYLES: Record<WorkOrderPaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  partial: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
};

export const PAYMENT_STATUS_LABELS: Record<WorkOrderPaymentStatus, string> = {
  pending: 'Pendiente',
  partial: 'Parcial',
  paid: 'Pagado',
};

export function WorkOrderPaymentStatusBadge({
  status,
}: {
  status: WorkOrderPaymentStatus;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        PAYMENT_STATUS_STYLES[status]
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
