import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../api/create-category';
import type { CategoryFormValues } from '../types';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CategoryFormValues) => createCategory(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'list'] });
    },
  });
}
