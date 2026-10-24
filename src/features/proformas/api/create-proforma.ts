import { parseApiError } from '@/lib/api-error';
import type {
  ConvertProformaPayload,
  CreateProformaPayload,
  Proforma,
} from '../types';

export async function createProforma(
  payload: CreateProformaPayload
): Promise<Proforma> {
  // Walk-in proformas omit clientId entirely; '' means no client selected.
  const body = {
    ...(payload.clientId ? { clientId: payload.clientId } : {}),
    ...(payload.branchId ? { branchId: payload.branchId } : {}),
    ...(payload.employeeId ? { employeeId: payload.employeeId } : {}),
    ...(payload.notes ? { notes: payload.notes } : {}),
    productLines: payload.productLines,
  };

  const response = await fetch(`${import.meta.env.VITE_API_URL}/proformas`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create proforma');
  }

  return (await response.json()) as Proforma;
}

export async function convertProforma(
  id: string,
  payload: ConvertProformaPayload
): Promise<Proforma> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/proformas/${id}/convert-to-sale`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to convert proforma');
  }

  return (await response.json()) as Proforma;
}
