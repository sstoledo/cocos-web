import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeProductImage } from '../api/remove-product-image';

export function useRemoveProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeProductImage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', id] });
    },
  });
}
