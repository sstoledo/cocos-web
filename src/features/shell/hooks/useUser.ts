import { useQuery } from '@tanstack/react-query';
import type { User } from '../types';

export function useUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'session', 'user'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return (await response.json()) as User | undefined;
    },
    retry: false,
  });

  return {
    user: data ?? null,
    isLoading,
    error,
  };
}
