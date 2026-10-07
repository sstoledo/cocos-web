import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export async function deleteService(id: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/services/${id}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete service: ${response.status}`);
  }
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', 'list'] });
      toast.success('Servicio eliminado correctamente');
    },
    onError: () => {
      toast.error('No se pudo eliminar el servicio');
    },
  });
}
