import { parseApiError } from '@/lib/api-error';
import type { CreateSalePayload, Sale } from '../types';

export async function createSale(payload: CreateSalePayload): Promise<Sale> {
  // Backend treats both arrays as optional-but-non-empty; the service layer
  // coalesces empty arrays, so we always send them (D7 — B8 S5: only a sale
  // with zero lines in BOTH arrays is a 400).
  const body = {
    paymentMethod: payload.paymentMethod,
    // Walk-in sales omit clientId entirely; '' means no client selected.
    ...(payload.clientId ? { clientId: payload.clientId } : {}),
    ...(payload.branchId ? { branchId: payload.branchId } : {}),
    ...(payload.employeeId ? { employeeId: payload.employeeId } : {}),
    productLines: payload.productLines ?? [],
    serviceLines: payload.serviceLines ?? [],
  };

  const response = await fetch(`${import.meta.env.VITE_API_URL}/sales`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create sale');
  }

  return (await response.json()) as Sale;
}
