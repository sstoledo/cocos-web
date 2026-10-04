import { useQuery } from '@tanstack/react-query';
import { getService } from '../api/get-service';

export function useService(id: string) {
  return useQuery({
    queryKey: ['services', 'detail', id],
    queryFn: () => getService(id),
    enabled: Boolean(id),
  });
}
