import type { Product } from '../types';

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/products/${id}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status}`);
  }

  return (await response.json()) as Product;
}
