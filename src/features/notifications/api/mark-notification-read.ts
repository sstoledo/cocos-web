import { parseApiError } from '@/lib/api-error';
import type { Notification } from '../types';

export async function markNotificationRead(id: string): Promise<Notification> {
  // B11 contract: the read endpoint takes NO body and NO Content-Type
  // header (mirrors the B9/B10 no-body PATCH precedent).
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/notifications/${id}/read`,
    {
      method: 'PATCH',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to mark notification as read');
  }

  return (await response.json()) as Notification;
}
