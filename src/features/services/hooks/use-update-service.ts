import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateService } from '../api/update-service';
import type { ServiceFormValues } from '../types';

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: ServiceFormValues;
    }) => updateService(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['services', 'detail', variables.id],
      });
      toast.success('Servicio actualizado correctamente');
    },
  });
}
