import type { Ubigeo } from '../types';

/**
 * Resolves a stored code to its catalog entry. A code that is not in the
 * catalog resolves to null instead of throwing, so a stale setting degrades
 * to an empty field instead of breaking the settings screen.
 */
export async function getUbigeo(code: string): Promise<Ubigeo | null> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/ubigeos/${code}`,
    { credentials: 'include' }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ubigeo: ${response.status}`);
  }

  return (await response.json()) as Ubigeo;
}
