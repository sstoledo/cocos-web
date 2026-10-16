import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateServiceProduct } from '../api/update-service-product';

export function useUpdateServiceProduct(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => updateServiceProduct(serviceId, productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['service-products', serviceId],
      });
      toast.success('Cantidad actualizada correctamente');
    },
  });
}
