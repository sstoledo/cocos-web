import { useQuery } from '@tanstack/react-query';
import { getClientsForSelect } from '../api/get-clients-for-select';

export function useClientsSelect() {
  const {
    data: clients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['clients', 'select'],
    queryFn: getClientsForSelect,
  });

  return { clients, isLoading, error };
}
