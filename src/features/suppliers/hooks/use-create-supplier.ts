import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSupplier } from '../api/create-supplier';
import type { SupplierFormValues } from '../types';

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SupplierFormValues) => createSupplier(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'list'] });
      toast.success('Proveedor creado correctamente');
    },
  });
}
