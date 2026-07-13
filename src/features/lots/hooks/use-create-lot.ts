import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLot } from '../api/create-lot';
import type { LotFormValues } from '../types';

export function useCreateLot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LotFormValues) => createLot(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots', 'list'] });
    },
  });
}
