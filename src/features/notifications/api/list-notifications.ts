import { parseApiError } from '@/lib/api-error';
import type {
  ListNotificationsParams,
  NotificationListResponse,
} from '../types';

export async function listNotifications(
  params: ListNotificationsParams
): Promise<NotificationListResponse> {
  const searchParams = new URLSearchParams();

  // B11 contract: `unread` is only sent when true (absent = all).
  if (params.unread) {
    searchParams.set('unread', 'true');
  }

  if (params.page) {
    searchParams.set('page', params.page.toString());
  }

  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/notifications${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch notifications');
  }

  return (await response.json()) as NotificationListResponse;
}
