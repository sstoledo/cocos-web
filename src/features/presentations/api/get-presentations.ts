import type { Presentation, PresentationListFilters } from '../types';

export async function getPresentations(
  filters: PresentationListFilters
): Promise<Presentation[]> {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set('q', filters.q);
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/presentations${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch presentations: ${response.status}`);
  }

  return (await response.json()) as Presentation[];
}
