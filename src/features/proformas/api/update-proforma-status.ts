import { parseApiError } from '@/lib/api-error';
import type { Proforma } from '../types';

export async function updateProformaStatus(
  id: string,
  status: ProformaStatus
): Promise<Proforma> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/proformas/${id}/status`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to update proforma status');
  }

  return (await response.json()) as Proforma;
}

type ProformaStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
