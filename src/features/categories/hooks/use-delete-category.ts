import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteCategory } from '../api/delete-category';

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'list'] });
      toast.success('Categoría eliminada correctamente');
    },
    onError: () => {
      toast.error('No se pudo eliminar la categoría');
    },
  });
}
