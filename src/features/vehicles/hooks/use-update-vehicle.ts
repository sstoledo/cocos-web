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
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['vehicles', 'detail', variables.id],
      });
      toast.success('Vehículo actualizado correctamente');
    },
  });
}
