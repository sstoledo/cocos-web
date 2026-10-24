import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { convertProforma } from '../api/create-proforma';
import type { ConvertProformaPayload } from '../types';

export function useConvertProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ConvertProformaPayload;
    }) => convertProforma(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
      toast.success('Proforma convertida a venta correctamente');
    },
  });
}
