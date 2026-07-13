import { useQuery } from '@tanstack/react-query';
import { getProductReferences } from '../api/get-product-references';

export function useProductReferences() {
  const {
    data: references,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', 'references'],
    queryFn: getProductReferences,
  });

  return {
    presentations: references?.presentations ?? [],
    brands: references?.brands ?? [],
    categories: references?.categories ?? [],
    isLoading,
    error,
  };
}
