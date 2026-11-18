import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { EmissionResult } from '../../sunat/types';
import { emitSale } from '../api/emit-sale';

export function useEmitSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emitSale(id),
    onSuccess: (_result: EmissionResult, id: string) => {
      // The sale state now carries SUNAT fields; both the detail view and
      // every list variant must re-read them.
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', id] });
    },
  });
}
