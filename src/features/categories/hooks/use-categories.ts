import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/get-categories';
import type { CategoryListFilters } from '../types';

export function useCategories(filters: CategoryListFilters) {
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories', 'list', filters],
    queryFn: () => getCategories(filters),
  });

  return { categories, isLoading, error };
}
