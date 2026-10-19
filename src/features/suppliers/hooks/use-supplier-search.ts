import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getSuppliers } from '../api/get-suppliers';

export const SUPPLIER_SEARCH_LIMIT = 20;

// Selector search: top-20 by name, keyed by the term.
export function useSupplierSearch(query: string) {
  const term = query.trim();
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['suppliers', 'search', term],
    queryFn: () =>
      getSuppliers({ q: term || undefined, limit: SUPPLIER_SEARCH_LIMIT }),
    placeholderData: keepPreviousData,
  });

  return {
    suppliers: data?.data ?? [],
    isLoading: isLoading || isFetching,
    error,
  };
}
