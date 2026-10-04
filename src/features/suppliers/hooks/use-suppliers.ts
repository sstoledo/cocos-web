import { useQuery } from '@tanstack/react-query';
import { getSuppliers } from '../api/get-suppliers';
import type { SupplierListFilters } from '../types';

export function useSuppliers(filters: SupplierListFilters) {
  const {
    data: suppliers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['suppliers', 'list', filters],
    queryFn: () => getSuppliers(filters),
  });

  return { suppliers, isLoading, error };
}
