import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getUbigeos } from '../api/get-ubigeos';

// Selector search: top-20 districts matching the term, keyed by the term so
// each search caches independently.
export function useUbigeoSearch(query: string) {
  const term = query.trim();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['ubigeos', 'search', term],
    queryFn: () => getUbigeos(term),
    placeholderData: keepPreviousData,
  });

  return {
    ubigeos: data ?? [],
    isLoading: isLoading || isFetching,
  };
}
