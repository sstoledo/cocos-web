import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const response = await authClient.getSession();
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
  });

  return {
    user: data?.user ?? null,
    isLoading,
    error,
  };
}
