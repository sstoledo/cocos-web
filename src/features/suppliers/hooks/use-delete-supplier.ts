import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteSupplier } from '../api/delete-supplier';

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'list'] });
      toast.success('Proveedor eliminado correctamente');
    },
    onError: () => {
      toast.error('No se pudo eliminar el proveedor');
    },
  });
}
