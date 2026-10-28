import type { NotificationType } from '../types';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  work_order_ready: 'Orden lista',
  purchase_order_received: 'OC recibida',
};

const NOTIFICATION_TYPE_STYLES: Record<NotificationType, string> = {
  work_order_ready: 'bg-primary text-primary-foreground',
  purchase_order_received: 'bg-success text-success-foreground',
};

export function NotificationTypeBadge({ type }: { type: NotificationType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${NOTIFICATION_TYPE_STYLES[type]}`}
    >
      {NOTIFICATION_TYPE_LABELS[type]}
    </span>
  );
}
