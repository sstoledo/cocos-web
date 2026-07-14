import type { PaginatedResponse, Vehicle, VehicleListFilters } from '../types';

export type GetVehiclesFilters = VehicleListFilters & { clientId: string };

export async function getVehicles(
  filters: GetVehiclesFilters
): Promise<PaginatedResponse<Vehicle>> {
  const searchParams = new URLSearchParams();

  searchParams.set('clientId', filters.clientId);

  if (filters.page) {
    searchParams.set('page', filters.page.toString());
  }

  if (filters.limit) {
    searchParams.set('limit', filters.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/vehicles${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error(`Failed to fetch vehicles: ${response.status}`);
  }

  return (await response.json()) as PaginatedResponse<Vehicle>;
}
