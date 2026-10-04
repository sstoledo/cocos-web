import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPresentation } from '../api/create-presentation';
import type { PresentationFormValues } from '../types';

export function useCreatePresentation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PresentationFormValues) => createPresentation(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations', 'list'] });
    },
  });
}
