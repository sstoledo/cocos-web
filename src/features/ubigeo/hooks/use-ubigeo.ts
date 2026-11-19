import { useQuery } from '@tanstack/react-query';
import { getUbigeo } from '../api/get-ubigeo';
import type { Ubigeo } from '../types';

const isCode = (value: string | null): value is string =>
  typeof value === 'string' && /^\d{6}$/.test(value);

/**
 * Resolves the selected code to its catalog entry so the combobox can show a
 * label. The catalog is static, so a resolved code is never refetched.
 */
export function useUbigeo(code: string | null): Ubigeo | null {
  const { data } = useQuery({
    queryKey: ['ubigeos', 'code', code],
    queryFn: () => getUbigeo(code ?? ''),
    enabled: isCode(code),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return data ?? null;
}
