import { parseApiError } from '@/lib/api-error';
import type { ServiceProduct } from '../types';

export async function getServiceProducts(
  serviceId: string
): Promise<ServiceProduct[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/services/${serviceId}/products`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch service products');
  }

  return (await response.json()) as ServiceProduct[];
}
