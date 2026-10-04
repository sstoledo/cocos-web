import { useQuery } from '@tanstack/react-query';
import { getVehicle } from '../api/get-vehicle';

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicles', 'detail', id],
    queryFn: () => getVehicle(id),
    enabled: Boolean(id),
  });
}
