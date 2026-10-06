import { useQuery } from '@tanstack/react-query';
import { getUser } from '../api/get-user';

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  });
}
