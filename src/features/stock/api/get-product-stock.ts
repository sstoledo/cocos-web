import type { ProductStock } from '../types';

export async function getProductStock(
  productId: string
): Promise<ProductStock> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/stock/products/${productId}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch product stock: ${response.status}`);
  }

  return (await response.json()) as ProductStock;
}
