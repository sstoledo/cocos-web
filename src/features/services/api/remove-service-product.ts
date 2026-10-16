import { parseApiError } from '@/lib/api-error';

export async function removeServiceProduct(
  serviceId: string,
  productId: string
): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/services/${serviceId}/products/${productId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to remove service product');
  }
}
