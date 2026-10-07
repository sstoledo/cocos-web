import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateSupplier } from '../api/update-supplier';
import type { SupplierFormValues } from '../types';

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<SupplierFormValues>;
    }) => updateSupplier(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
      toast.success('Proveedor actualizado correctamente');
    },
  });
}
