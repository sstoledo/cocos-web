import { parseApiError } from '@/lib/api-error';
import type { CreateSalePayload, Sale } from '../types';

export async function createSale(payload: CreateSalePayload): Promise<Sale> {
  // Products-only (decision/sales-products-only): the backend rejects the
  // sale with SALE_EMPTY_LINES when productLines is empty, so the key is
  // always sent with at least one line validated by the zod schema.
  const body = {
    paymentMethod: payload.paymentMethod,
    // Walk-in sales omit clientId entirely; '' means no client selected.
    ...(payload.clientId ? { clientId: payload.clientId } : {}),
    ...(payload.branchId ? { branchId: payload.branchId } : {}),
    ...(payload.employeeId ? { employeeId: payload.employeeId } : {}),
    productLines: payload.productLines,
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
