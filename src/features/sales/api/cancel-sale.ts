import { parseApiError } from '@/lib/api-error';
import type { Sale } from '../types';

export async function cancelSale(id: string): Promise<Sale> {
  // B9 contract: the cancel endpoint takes NO body (no price, no reason)
  // and NO Content-Type header — SL-NF5/S2.
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/sales/${id}/cancel`,
    {
      method: 'PATCH',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to cancel sale');
  }

  return (await response.json()) as Sale;
}
