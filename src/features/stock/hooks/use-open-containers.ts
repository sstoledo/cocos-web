import { useQuery } from '@tanstack/react-query';
import { getOpenContainers } from '../api/get-open-containers';

export function useOpenContainers(productId: string, enabled = true) {
  return useQuery({
    queryKey: ['stock', 'open-containers', productId],
    queryFn: () => getOpenContainers(productId),
    enabled: enabled && Boolean(productId),
  });
}
