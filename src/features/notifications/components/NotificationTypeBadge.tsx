import { cn } from '@/lib/utils';
import type { NotificationType } from '../types';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  work_order_ready: 'Orden lista',
  purchase_order_received: 'OC recibida',
};

const NOTIFICATION_TYPE_STYLES: Record<NotificationType, string> = {
  work_order_ready: 'bg-blue-100 text-blue-800 border-blue-200',
  purchase_order_received: 'bg-green-100 text-green-800 border-green-200',
};

export function NotificationTypeBadge({ type }: { type: NotificationType }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        NOTIFICATION_TYPE_STYLES[type]
      )}
    >
      {NOTIFICATION_TYPE_LABELS[type]}
    </span>
  );
}
