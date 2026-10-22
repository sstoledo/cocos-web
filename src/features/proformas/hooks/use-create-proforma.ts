import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createProforma } from '../api/create-proforma';
import type { CreateProformaPayload } from '../types';

export function useCreateProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProformaPayload) => createProforma(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
      toast.success('Proforma creada correctamente');
    },
  });
}
