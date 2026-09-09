import { parseApiError } from '@/lib/api-error';
import type { SaleListFilters, SaleListResponse } from '../types';

export async function getSales(
  filters: SaleListFilters
): Promise<SaleListResponse> {
  const searchParams = new URLSearchParams();

  if (filters.saleNumber) {
    searchParams.set('saleNumber', filters.saleNumber);
  }

  // The backend `to` filter is lte at midnight; shift to end-of-day so the
  // selected day is included (SL-F2). `from` starts at the day beginning.
  if (filters.from) {
    searchParams.set('from', `${filters.from}T00:00:00.000`);
  }

  if (filters.to) {
    searchParams.set('to', `${filters.to}T23:59:59.999`);
  }

  if (filters.clientId) {
    searchParams.set('clientId', filters.clientId);
  }

  if (filters.status) {
    searchParams.set('status', filters.status);
  }

  if (filters.page) {
    searchParams.set('page', filters.page.toString());
  }

  if (filters.limit) {
    searchParams.set('limit', filters.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/sales${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch sales');
  }

  return (await response.json()) as SaleListResponse;
}
