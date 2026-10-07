import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createVehicle } from '../api/create-vehicle';
import type { VehicleFormValues } from '../types';

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: VehicleFormValues) => createVehicle(values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['vehicles', variables.clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['client', variables.clientId],
      });
      toast.success('Vehículo creado correctamente');
    },
  });
}
