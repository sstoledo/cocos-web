import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createCashClosing } from '../api/create-cash-closing';
import type { CreateCashClosingInput } from '../types';

export function useCreateCashClosing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCashClosingInput) => createCashClosing(input),
    onSuccess: () => {
      // Prefix invalidation covers preview, list variants and detail.
      queryClient.invalidateQueries({ queryKey: ['cash-closings'] });
      toast.success('Cierre de caja registrado correctamente');
    },
  });
}
