import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStockMovement } from '../api/create-stock-movement';
import type { CreateStockMovementInput } from '../api/create-stock-movement';

export function useCreateStockMovement(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateStockMovementInput, 'productId'>) =>
      createStockMovement({ productId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['stock', 'product', productId],
      });
      queryClient.invalidateQueries({
        queryKey: ['stock', 'movements', productId],
      });
    },
  });
}
