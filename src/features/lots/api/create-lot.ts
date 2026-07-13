import type { Lot } from '../types';
import type { LotFormValues } from '../types';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function createLot(values: LotFormValues): Promise<Lot> {
  const body = {
    lotNumber: values.lotNumber,
    supplierId: values.supplierId,
    receivedAt: formatDate(values.receivedAt),
    notes: values.notes,
    items: values.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      costPrice: item.costPrice,
      expirationDate: formatDate(item.expirationDate),
    })),
  };

  const response = await fetch(`${import.meta.env.VITE_API_URL}/lots`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to create lot: ${response.status}`);
  }

  return (await response.json()) as Lot;
}
