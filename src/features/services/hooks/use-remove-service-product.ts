import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { removeServiceProduct } from '../api/remove-service-product';

export function useRemoveServiceProduct(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      removeServiceProduct(serviceId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['service-products', serviceId],
      });
      toast.success('Producto quitado de la receta');
    },
  });
}
