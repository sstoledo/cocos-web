import { parseApiError } from '@/lib/api-error';

export async function deleteWorkOrder(id: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/work-orders/${id}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to delete work order');
  }
}
