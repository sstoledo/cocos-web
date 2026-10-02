// Types transcribed from the B11 notifications backend contract
// (obs #1278 + #1286). Do NOT invent new shapes here.
export type NotificationType = 'work_order_ready' | 'purchase_order_received';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  // Internal route (e.g. /work-orders/:id, /purchase-orders/:id).
  link: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: NotificationListMeta;
}

export interface ListNotificationsParams {
  unread?: boolean;
  page?: number;
  limit?: number;
}

export interface MarkAllNotificationsReadResponse {
  count: number;
}
