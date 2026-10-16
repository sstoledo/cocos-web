import { parseApiError } from '@/lib/api-error';
import type { ConsumptionEvent, CreateConsumptionPayload } from '../types';

export async function createWorkOrderConsumption(
  workOrderId: string,
  payload: CreateConsumptionPayload
): Promise<ConsumptionEvent> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/work-orders/${workOrderId}/consumptions`,
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
    // Keep errorCode and details: the error mapper surfaces
    // INSUFFICIENT_STOCK amounts and NO_OPEN_CONTAINER in Spanish.
    throw await parseApiError(
      response,
      'Failed to create work order consumption'
    );
  }

  return (await response.json()) as ConsumptionEvent;
}
