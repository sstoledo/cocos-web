import { useQuery } from '@tanstack/react-query';
import { getClient } from '../api/get-client';

export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClient(id),
    enabled: Boolean(id),
  });
}
