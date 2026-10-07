import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateBrand } from '../api/update-brand';
import type { BrandFormValues } from '../types';

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<BrandFormValues>;
    }) => updateBrand(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brands', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['brand', variables.id] });
      toast.success('Marca actualizada correctamente');
    },
  });
}
