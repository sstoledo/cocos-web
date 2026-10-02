import { useQuery } from '@tanstack/react-query';
import { getClosingPreview } from '../api/get-closing-preview';

export function useClosingPreview() {
  return useQuery({
    queryKey: ['cash-closings', 'preview'],
    queryFn: () => getClosingPreview(),
  });
}
