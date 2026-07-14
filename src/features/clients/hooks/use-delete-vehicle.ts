import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteVehicle } from '../api/delete-vehicle';

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; clientId: string }) => deleteVehicle(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['client', variables.clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['vehicles', variables.clientId],
      });
    },
  });
}
