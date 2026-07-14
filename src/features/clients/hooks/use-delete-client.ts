import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteClient } from '../api/delete-client';

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
