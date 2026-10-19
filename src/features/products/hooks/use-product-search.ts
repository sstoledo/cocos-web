import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/get-products';

export const PRODUCT_SEARCH_LIMIT = 20;

// Selector search: top-20 by name/code, keyed by the term and isActive so
// each combination caches independently.
export function useProductSearch(query: string, isActive?: boolean) {
  const term = query.trim();
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['products', 'search', term, isActive ?? null],
    queryFn: () =>
      getProducts({
        q: term || undefined,
        isActive,
        limit: PRODUCT_SEARCH_LIMIT,
      }),
    placeholderData: keepPreviousData,
  });

  return {
    products: data?.data ?? [],
    isLoading: isLoading || isFetching,
    error,
  };
}
