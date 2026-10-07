import type { PaginationMeta } from '@/components/ui/Pagination';

type BackendListMeta = {
  page: number;
  limit: number;
  total: number;
};

/**
 * Maps the backend list meta (`page`/`limit`/`total`) to the shape the
 * `<Pagination />` component expects (`page`/`total`/`totalPages`).
 */
export function toPaginationMeta(meta: BackendListMeta): PaginationMeta {
  return {
    page: meta.page,
    total: meta.total,
    totalPages: meta.limit > 0 ? Math.ceil(meta.total / meta.limit) : 0,
  };
}
