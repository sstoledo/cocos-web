import { useQuery } from '@tanstack/react-query';
import { getReceipts } from '../api/get-receipts';
import type { ReceiptStatus } from '../types';

export function useReceipts(status?: ReceiptStatus) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['receipts', status ?? null],
    queryFn: () => getReceipts(status),
  });

  return { receipts: data ?? [], isLoading, error };
}
