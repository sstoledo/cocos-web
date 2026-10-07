import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createService } from '../api/create-service';
import type { ServiceFormValues } from '../types';

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ServiceFormValues) => createService(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', 'list'] });
      toast.success('Servicio creado correctamente');
    },
  });
}
