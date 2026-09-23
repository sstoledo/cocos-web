import { parseApiError } from '@/lib/api-error';
import type { CreatePurchaseOrderPayload, PurchaseOrder } from '../types';

export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload
): Promise<PurchaseOrder> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/purchase-orders`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create purchase order');
  }

  return (await response.json()) as PurchaseOrder;
}
