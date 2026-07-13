import type { Client, ClientListFilters, PaginatedResponse } from '../types';

export async function getClients(
  filters: ClientListFilters
): Promise<PaginatedResponse<Client>> {
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
  const url = `${import.meta.env.VITE_API_URL}/clients${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error(`Failed to fetch clients: ${response.status}`);
  }

  return (await response.json()) as PaginatedResponse<Client>;
}
