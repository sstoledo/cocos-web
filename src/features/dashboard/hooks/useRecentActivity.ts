import { useUser } from '@/features/shell/hooks/useUser';
import { useQuery } from '@tanstack/react-query';

export type ActivityItem = {
  id: string;
  description: string;
  time: string;
};

export function useRecentActivity() {
  const { user } = useUser();
  const {
    data: activities = [],
    isLoading,
    error,
  } = useQuery<ActivityItem[]>({
    queryKey: ['dashboard', 'activity', user?.id ?? 'anonymous'],
    queryFn: async () => [],
  });

  return { activities, isLoading, error };
}
