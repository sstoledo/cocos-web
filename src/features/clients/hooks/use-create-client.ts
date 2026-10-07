import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createClient } from '../api/create-client';
import type { ClientFormValues } from '../types';

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ClientFormValues) => createClient(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente creado correctamente');
    },
  });
}
