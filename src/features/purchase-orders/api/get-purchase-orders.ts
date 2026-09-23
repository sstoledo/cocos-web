import { parseApiError } from '@/lib/api-error';
import type {
  PurchaseOrderListFilters,
  PurchaseOrderListResponse,
} from '../types';

export async function getPurchaseOrders(
  filters: PurchaseOrderListFilters
): Promise<PurchaseOrderListResponse> {
  const searchParams = new URLSearchParams();

  if (filters.status) {
    searchParams.set('status', filters.status);
  }

  if (filters.supplierId) {
    searchParams.set('supplierId', filters.supplierId);
  }

  if (filters.purchaseOrderNumber) {
    searchParams.set('purchaseOrderNumber', filters.purchaseOrderNumber);
  }

  if (filters.page) {
    searchParams.set('page', filters.page.toString());
  }

  if (filters.limit) {
    searchParams.set('limit', filters.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/purchase-orders${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch purchase orders');
  }

  return (await response.json()) as PurchaseOrderListResponse;
}
