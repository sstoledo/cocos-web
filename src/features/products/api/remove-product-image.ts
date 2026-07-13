import type { Product } from '../types';

export async function removeProductImage(id: string): Promise<Product> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/products/${id}/image`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to remove product image: ${response.status}`);
  }

  return (await response.json()) as Product;
}
