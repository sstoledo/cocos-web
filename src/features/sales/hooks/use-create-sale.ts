import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSale } from '../api/create-sale';
import type { CreateSalePayload } from '../types';

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSalePayload) => createSale(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Venta creada correctamente');
    },
  });
}
