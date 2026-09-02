import type { Service, ServiceListFilters } from '../types';

export async function getServices(
  filters: ServiceListFilters
): Promise<Service[]> {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set('q', filters.q);
  }

  if (filters.isActive !== undefined) {
    searchParams.set('isActive', filters.isActive.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/services${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch services: ${response.status}`);
  }

  return (await response.json()) as Service[];
}
