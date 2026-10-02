import { parseApiError } from '@/lib/api-error';
import type { MarkAllNotificationsReadResponse } from '../types';

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResponse> {
  // B11 contract: NO body and NO Content-Type header (B9/B10 precedent).
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/notifications/read-all`,
    {
      method: 'PATCH',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(
      response,
      'Failed to mark all notifications as read'
    );
  }

  return (await response.json()) as MarkAllNotificationsReadResponse;
}
