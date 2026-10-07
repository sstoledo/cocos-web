import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteUser } from '../api/delete-user';

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      toast.success('Usuario eliminado correctamente');
    },
    onError: () => {
      toast.error('No se pudo eliminar el usuario');
    },
  });
}
