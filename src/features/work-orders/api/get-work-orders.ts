import type { WorkOrderListFilters, WorkOrderListResponse } from '../types';

export async function getWorkOrders(
  filters: WorkOrderListFilters
): Promise<WorkOrderListResponse> {
  const searchParams = new URLSearchParams();

  if (filters.query) {
    searchParams.set('query', filters.query);
  }

  if (filters.page) {
    searchParams.set('page', filters.page.toString());
  }

  if (filters.limit) {
    searchParams.set('limit', filters.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/work-orders${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error(`Failed to fetch work orders: ${response.status}`);
  }

  return (await response.json()) as WorkOrderListResponse;
}
