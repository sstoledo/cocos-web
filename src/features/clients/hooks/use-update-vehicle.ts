import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateVehicle } from '../api/update-vehicle';
import type { VehicleFormValues } from '../types';

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: VehicleFormValues;
    }) => updateVehicle(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['client', variables.values.clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['vehicles', variables.values.clientId],
      });
      toast.success('Vehículo actualizado correctamente');
    },
  });
}
