import { ApiError } from '@/lib/api-error';
import type { EmissionResult } from '../../sunat/types';

/**
 * Emission failures carry dynamic, user-facing messages (missing config or
 * SUNAT CDR text), so the backend body message is preserved verbatim instead
 * of the generic parseApiError fallback.
 */
export async function emitSale(id: string): Promise<EmissionResult> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/sales/${id}/emit`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    let message: string | undefined;
    try {
      const body = (await response.json()) as { message?: string };
      message = body.message;
    } catch {
      message = undefined;
    }
    throw new ApiError(
      message ?? `Failed to emit sale: ${response.status}`,
      response.status
    );
  }

  return (await response.json()) as EmissionResult;
}
