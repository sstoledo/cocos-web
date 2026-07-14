import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '../api/create-client';
import type { ClientFormValues } from '../types';

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ClientFormValues) => createClient(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
