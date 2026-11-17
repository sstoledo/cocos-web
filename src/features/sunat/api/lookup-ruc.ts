import type { RucLookupResult } from '@/features/sunat/types';

export async function lookupRuc(ruc: string): Promise<RucLookupResult> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/sunat/ruc/${ruc}`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    const message =
      response.status === 404
        ? 'RUC no encontrado en el padrón de SUNAT'
        : 'La consulta RUC no está disponible';
    throw new Error(message);
  }

  return (await response.json()) as RucLookupResult;
}
