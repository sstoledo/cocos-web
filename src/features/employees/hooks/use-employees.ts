import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '../api/get-employees';

export function useEmployees() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', 'list'],
    queryFn: getEmployees,
  });

  return {
    employees: data ?? [],
    isLoading,
    error,
  };
}
