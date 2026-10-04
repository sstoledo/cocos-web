import { useQuery } from '@tanstack/react-query';
import { getPresentation } from '../api/get-presentation';

export function usePresentation(id: string) {
  return useQuery({
    queryKey: ['presentation', id],
    queryFn: () => getPresentation(id),
    enabled: Boolean(id),
  });
}
