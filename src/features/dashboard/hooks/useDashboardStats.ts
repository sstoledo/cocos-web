import { useUser } from '@/features/shell/hooks/useUser';
import { useQuery } from '@tanstack/react-query';

export type DashboardStat = {
  label: string;
  value: number;
};

export function useDashboardStats() {
  const { user } = useUser();
  const {
    data: stats = [],
    isLoading,
    error,
  } = useQuery<DashboardStat[]>({
    queryKey: ['dashboard', 'stats', user?.id ?? 'anonymous'],
    queryFn: async () => [],
  });

  return { stats, isLoading, error };
}
