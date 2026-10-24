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
    onSuccess: (_proforma, { id }) => {
      // ['proformas'] covers every list variant; ['proforma', id] flips the
      // detail badge without a refresh (sale hook parity SL-F14).
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
      queryClient.invalidateQueries({ queryKey: ['proforma', id] });
      toast.success('Proforma convertida a venta correctamente');
    },
  });
}
