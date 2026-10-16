import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addServiceProduct } from '../api/add-service-product';
import type { CreateServiceProductPayload } from '../types';

export function useAddServiceProduct(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateServiceProductPayload) =>
      addServiceProduct(serviceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['service-products', serviceId],
      });
      toast.success('Producto agregado a la receta');
    },
  });
}
