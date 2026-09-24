import { parseApiError } from '@/lib/api-error';
import type { PurchaseOrder } from '../types';

export async function orderPurchaseOrder(id: string): Promise<PurchaseOrder> {
  // B10 contract: the order endpoint takes NO body and NO Content-Type
  // header (mirrors the B9 cancel-sale precedent).
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/purchase-orders/${id}/order`,
    {
      method: 'PATCH',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to order purchase order');
  }

  return (await response.json()) as PurchaseOrder;
}
