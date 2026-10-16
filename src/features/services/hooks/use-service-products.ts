import { useQuery } from '@tanstack/react-query';
import { getServiceProducts } from '../api/get-service-products';

export function useServiceProducts(serviceId: string) {
  return useQuery({
    queryKey: ['service-products', serviceId],
    queryFn: () => getServiceProducts(serviceId),
    enabled: Boolean(serviceId),
  });
}
