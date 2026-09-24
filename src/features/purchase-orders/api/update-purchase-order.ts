import { parseApiError } from '@/lib/api-error';
import type { PurchaseOrder, UpdatePurchaseOrderPayload } from '../types';

// B10: PATCH fully replaces the line set; only allowed while status is draft.
export async function updatePurchaseOrder(
  id: string,
  payload: UpdatePurchaseOrderPayload
): Promise<PurchaseOrder> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/purchase-orders/${id}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to update purchase order');
  }

  return (await response.json()) as PurchaseOrder;
}
