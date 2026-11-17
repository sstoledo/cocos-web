import { useQuery } from '@tanstack/react-query';
import { getCompanySettings } from '../api/get-company-settings';

export function useCompanySettings() {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: getCompanySettings,
  });
}
