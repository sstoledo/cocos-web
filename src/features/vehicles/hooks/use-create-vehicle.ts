import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVehicle } from '../api/create-vehicle';
import type { VehicleFormValues } from '../types';

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: VehicleFormValues) => createVehicle(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'list'] });
    },
  });
}
