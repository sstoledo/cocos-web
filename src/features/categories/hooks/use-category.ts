import { useQuery } from '@tanstack/react-query';
import { getCategory } from '../api/get-category';

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategory(id),
    enabled: Boolean(id),
  });
}
