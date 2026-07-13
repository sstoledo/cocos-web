import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct } from '../api/update-product';
import type { ProductFormValues } from '../types';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
      image,
    }: {
      id: string;
      values: ProductFormValues;
      image?: File;
    }) => updateProduct(id, values, image),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['products', 'detail', variables.id],
      });
    },
  });
}
