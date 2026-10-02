import { parseApiError } from '@/lib/api-error';
import type { CashClosingListResponse, ListCashClosingsParams } from '../types';

export async function listCashClosings(
  params: ListCashClosingsParams
): Promise<CashClosingListResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set('page', params.page.toString());
  }

  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/cash-closings${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch cash closings');
  }

  return (await response.json()) as CashClosingListResponse;
}
