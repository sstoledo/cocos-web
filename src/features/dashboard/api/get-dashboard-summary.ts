import { parseApiError } from '@/lib/api-error';
import type { DashboardSummary } from '../types';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/dashboard/summary`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch dashboard summary');
  }

  return (await response.json()) as DashboardSummary;
}
