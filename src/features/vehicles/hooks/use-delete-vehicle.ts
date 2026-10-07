import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteVehicle } from '../api/delete-vehicle';

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'list'] });
      toast.success('Vehículo eliminado correctamente');
    },
    onError: () => {
      toast.error('No se pudo eliminar el vehículo');
    },
  });
}
