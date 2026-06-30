import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import type { User } from '../types';

export function useUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'session', 'user'],
    queryFn: async () => {
      const response = await authClient.getSession();
      if (response.error) {
        throw response.error;
      }
      return response.data?.user as User | undefined;
    },
    retry: false,
  });

  return {
    user: data ?? null,
    isLoading,
    error,
  };
}
