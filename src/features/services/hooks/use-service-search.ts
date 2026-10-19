import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getServices } from '../api/get-services';

export const SERVICE_SEARCH_LIMIT = 20;

// Selector search: top-20 by name/code, keyed by the term.
export function useServiceSearch(query: string) {
  const term = query.trim();
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['services', 'search', term],
    queryFn: () =>
      getServices({ query: term || undefined, limit: SERVICE_SEARCH_LIMIT }),
    placeholderData: keepPreviousData,
  });

  return {
    services: data?.data ?? [],
    isLoading: isLoading || isFetching,
    error,
  };
}
