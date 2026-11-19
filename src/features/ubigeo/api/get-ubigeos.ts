import type { Ubigeo } from '../types';

export const UBIGEO_SEARCH_LIMIT = 20;

export async function getUbigeos(query: string): Promise<Ubigeo[]> {
  const term = query.trim();
  const searchParams = new URLSearchParams();

  if (term) {
    searchParams.set('query', term);
  }

  searchParams.set('limit', UBIGEO_SEARCH_LIMIT.toString());

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/ubigeos?${searchParams.toString()}`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ubigeos: ${response.status}`);
  }

  return (await response.json()) as Ubigeo[];
}
