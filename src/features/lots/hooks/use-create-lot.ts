import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createLot } from '../api/create-lot';
import type { LotFormValues } from '../types';

export function useCreateLot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LotFormValues) => createLot(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots', 'list'] });
      toast.success('Lote creado correctamente');
    },
  });
}
