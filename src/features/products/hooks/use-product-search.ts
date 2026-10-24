import { ApiError } from '@/lib/api-error';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/get-products';
import {
  isEmbeddingsNotConfiguredError,
  searchSemanticProducts,
} from '../api/search-semantic-products';

export const PRODUCT_SEARCH_LIMIT = 20;
export const SEMANTIC_SEARCH_MIN_TERM_LENGTH = 3;

function shouldFallBackToLegacySearch(error: unknown): boolean {
  return (
    isEmbeddingsNotConfiguredError(error) ||
    error instanceof TypeError ||
    (error instanceof ApiError && error.status >= 500)
  );
}

// Short terms preserve ILIKE code/prefix search; natural-language terms use
// semantic search, with legacy search as a cautious availability fallback.
export function useProductSearch(query: string, isActive?: boolean) {
  const term = query.trim();
  const mode =
    term.length >= SEMANTIC_SEARCH_MIN_TERM_LENGTH ? 'semantic' : 'legacy';
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['products', 'search', mode, term, isActive ?? null],
    queryFn: async () => {
      const searchLegacy = () =>
        getProducts({
          q: term || undefined,
          isActive,
          limit: PRODUCT_SEARCH_LIMIT,
        });

      if (mode === 'legacy') {
        return searchLegacy();
      }

      try {
        return await searchSemanticProducts({
          q: term,
          isActive,
          limit: PRODUCT_SEARCH_LIMIT,
        });
      } catch (error) {
        if (shouldFallBackToLegacySearch(error)) {
          return searchLegacy();
        }
        throw error;
      }
    },
    placeholderData: keepPreviousData,
  });

  return {
    products: data?.data ?? [],
    isLoading: isLoading || isFetching,
    error,
  };
}
