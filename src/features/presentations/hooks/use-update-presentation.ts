import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updatePresentation } from '../api/update-presentation';
import type { PresentationFormValues } from '../types';

export function useUpdatePresentation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<PresentationFormValues>;
    }) => updatePresentation(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presentations', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['presentation', variables.id],
      });
      toast.success('Presentación actualizada correctamente');
    },
  });
}
