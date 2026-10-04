import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '../api/delete-category';

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'list'] });
    },
  });
}
