import { useQuery } from '@tanstack/react-query';

export type ActivityItem = {
  id: string;
  description: string;
  time: string;
};

export function useRecentActivity() {
  const { data: activities = [], isLoading } = useQuery<ActivityItem[]>({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => [],
    staleTime: Number.POSITIVE_INFINITY,
  });

  return { activities, isLoading };
}
