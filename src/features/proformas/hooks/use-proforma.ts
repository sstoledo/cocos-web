import { useQuery } from '@tanstack/react-query';
import { getProforma } from '../api/get-proforma';

export function useProforma(id: string) {
  return useQuery({
    queryKey: ['proforma', id],
    queryFn: () => getProforma(id),
    enabled: Boolean(id),
  });
}
