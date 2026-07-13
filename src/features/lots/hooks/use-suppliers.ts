import { useQuery } from '@tanstack/react-query';
import { getSuppliers } from '../api/get-suppliers';

export function useSuppliers() {
  const {
    data: suppliers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,
  });

  return { suppliers, isLoading, error };
}
