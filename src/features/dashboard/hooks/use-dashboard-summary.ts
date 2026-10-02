import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/get-dashboard-summary';

// GET /dashboard/summary — ALL roles. The page owns loading/error rendering
// (F11.5); this hook only centralizes the data access.
export function useDashboardSummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
  });

  return { summary: data, isLoading, error };
}
