import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateProformaStatus } from '../api/update-proforma-status';
import type { ProformaStatus } from '../types';

export function useUpdateProformaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProformaStatus }) =>
      updateProformaStatus(id, status),
    onSuccess: (_proforma, { id }) => {
      // ['proformas'] covers every list variant; ['proforma', id] flips the
      // detail badge without a refresh (sale hook parity SL-F14).
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
      queryClient.invalidateQueries({ queryKey: ['proforma', id] });
      toast.success('Estado de la proforma actualizado');
    },
  });
}
