import { useQuery } from '@tanstack/react-query';

export type DashboardStat = {
  label: string;
  value: number;
};

export function useDashboardStats() {
  const { data: stats = [], isLoading } = useQuery<DashboardStat[]>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => [],
    staleTime: Number.POSITIVE_INFINITY,
  });

  return { stats, isLoading };
}
