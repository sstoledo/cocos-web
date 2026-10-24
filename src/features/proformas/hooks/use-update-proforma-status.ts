import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateProformaStatus } from '../api/update-proforma-status';
import type { ProformaStatus } from '../types';

export function useUpdateProformaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProformaStatus }) =>
      updateProformaStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
      toast.success('Estado de la proforma actualizado');
    },
  });
}
