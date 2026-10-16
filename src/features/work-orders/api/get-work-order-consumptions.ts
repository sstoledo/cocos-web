import { parseApiError } from '@/lib/api-error';
import type { ConsumptionEvent } from '../types';

export async function getWorkOrderConsumptions(
  workOrderId: string
): Promise<ConsumptionEvent[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/work-orders/${workOrderId}/consumptions`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(
      response,
      'Failed to fetch work order consumptions'
    );
  }

  return (await response.json()) as ConsumptionEvent[];
}
