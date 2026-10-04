import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCategory } from '../api/update-category';
import type { CategoryFormValues } from '../types';

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<CategoryFormValues>;
    }) => updateCategory(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  });
}
