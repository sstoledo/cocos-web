import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateCompanySettings } from '../api/update-company-settings';
import type { CompanySettingsPayload } from '../types';

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CompanySettingsPayload) =>
      updateCompanySettings(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast.success('Configuración de la empresa actualizada correctamente');
    },
  });
}
