import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePresentation } from '../api/delete-presentation';

export function useDeletePresentation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePresentation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations', 'list'] });
    },
  });
}
