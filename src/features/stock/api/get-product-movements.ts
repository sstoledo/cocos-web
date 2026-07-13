import type { StockMovement } from '../types';

export async function getProductMovements(
  productId: string
): Promise<StockMovement[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/stock/products/${productId}/movements`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch product movements: ${response.status}`);
  }

  return (await response.json()) as StockMovement[];
}
