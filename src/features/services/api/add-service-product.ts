import { parseApiError } from '@/lib/api-error';
import type { CreateServiceProductPayload, ServiceProduct } from '../types';

export async function addServiceProduct(
  serviceId: string,
  payload: CreateServiceProductPayload
): Promise<ServiceProduct> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/services/${serviceId}/products`,
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
    throw await parseApiError(response, 'Failed to add service product');
  }

  return (await response.json()) as ServiceProduct;
}
