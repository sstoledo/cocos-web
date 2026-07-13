import type { StockMovement } from '../types';

export type CreateStockMovementInput = {
  productId: string;
  quantity: number;
  reason?: string;
};

export async function createStockMovement(
  input: CreateStockMovementInput
): Promise<StockMovement> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/stock/movements`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: input.productId,
        quantity: input.quantity,
        reason: input.reason,
        type: 'adjustment',
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create stock movement: ${response.status}`);
  }

  return (await response.json()) as StockMovement;
}
