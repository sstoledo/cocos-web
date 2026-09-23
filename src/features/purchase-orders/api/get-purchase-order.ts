import { parseApiError } from '@/lib/api-error';
import type { PurchaseOrder } from '../types';

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/purchase-orders/${id}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch purchase order');
  }

  return (await response.json()) as PurchaseOrder;
}
