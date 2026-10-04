import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBrand } from '../api/delete-brand';

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands', 'list'] });
    },
  });
}
