import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClient } from '../api/update-client';
import type { ClientFormValues } from '../types';

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: ClientFormValues;
    }) => updateClient(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
    },
  });
}
