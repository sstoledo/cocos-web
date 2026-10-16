import { parseApiError } from '@/lib/api-error';
import type { ServiceProduct } from '../types';

export async function updateServiceProduct(
  serviceId: string,
  productId: string,
  quantity: number
): Promise<ServiceProduct> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/services/${serviceId}/products/${productId}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to update service product');
  }

  return (await response.json()) as ServiceProduct;
}
