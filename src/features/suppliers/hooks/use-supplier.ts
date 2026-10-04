import { useQuery } from '@tanstack/react-query';
import { getSupplier } from '../api/get-supplier';

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplier(id),
    enabled: Boolean(id),
  });
}
