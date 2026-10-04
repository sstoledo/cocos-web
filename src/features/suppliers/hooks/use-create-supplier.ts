import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupplier } from '../api/create-supplier';
import type { SupplierFormValues } from '../types';

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SupplierFormValues) => createSupplier(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'list'] });
    },
  });
}
