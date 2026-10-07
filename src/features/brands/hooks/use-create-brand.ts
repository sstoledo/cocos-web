import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createBrand } from '../api/create-brand';
import type { BrandFormValues } from '../types';

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: BrandFormValues) => createBrand(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands', 'list'] });
      toast.success('Marca creada correctamente');
    },
  });
}
