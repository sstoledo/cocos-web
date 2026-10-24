import { ApiError, parseApiError } from '@/lib/api-error';
import type { Product } from '../types';

export interface SemanticProductSearchFilters {
  q: string;
  limit?: number;
  isActive?: boolean;
}

export interface SemanticProductSearchResponse {
  data: Product[];
}

export function isEmbeddingsNotConfiguredError(
  error: unknown
): error is ApiError {
  return (
    error instanceof ApiError &&
    error.status === 503 &&
    error.errorCode === 'EMBEDDINGS_NOT_CONFIGURED'
  );
}

export async function searchSemanticProducts(
  filters: SemanticProductSearchFilters
): Promise<SemanticProductSearchResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('q', filters.q.trim());

  if (filters.limit !== undefined) {
    searchParams.set('limit', filters.limit.toString());
  }

  if (filters.isActive !== undefined) {
    searchParams.set('isActive', filters.isActive.toString());
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/products/search/semantic?${searchParams.toString()}`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw await parseApiError(
      response,
      'Failed to search products semantically'
    );
  }

  return (await response.json()) as SemanticProductSearchResponse;
}
