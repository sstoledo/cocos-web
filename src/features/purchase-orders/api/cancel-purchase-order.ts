import { parseApiError } from '@/lib/api-error';
import type { PurchaseOrder } from '../types';

export async function cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
  // B10 contract: the cancel endpoint takes NO body and NO Content-Type
  // header (mirrors the B9 cancel-sale precedent).
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/purchase-orders/${id}/cancel`,
    {
      method: 'PATCH',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to cancel purchase order');
  }

  return (await response.json()) as PurchaseOrder;
}
