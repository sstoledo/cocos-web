import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createProduct } from '../api/create-product';
import type { ProductFormValues } from '../types';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      values,
      image,
    }: {
      values: ProductFormValues;
      image?: File;
    }) => createProduct(values, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
      toast.success('Producto creado correctamente');
    },
  });
}
