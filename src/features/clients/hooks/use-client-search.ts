import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getClients } from '../api/get-clients';

export const CLIENT_SEARCH_LIMIT = 20;

// Selector search: top-20 by name/identification, keyed by the term so
// each search caches independently.
export function useClientSearch(query: string) {
  const term = query.trim();
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['clients', 'search', term],
    queryFn: () =>
      getClients({ query: term || undefined, limit: CLIENT_SEARCH_LIMIT }),
    placeholderData: keepPreviousData,
  });

  return {
    clients: data?.data ?? [],
    isLoading: isLoading || isFetching,
    error,
  };
}
