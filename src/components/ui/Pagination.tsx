import { Button } from '@/components/ui/Button';

export type PaginationMeta = {
  page: number;
  total: number;
  totalPages: number;
};

export type PaginationProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

export function Pagination({ meta, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(meta.page - 1)}
        disabled={meta.page <= 1}
        aria-label="Página anterior"
      >
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {meta.page} de {meta.totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(meta.page + 1)}
        disabled={meta.page >= meta.totalPages}
        aria-label="Página siguiente"
      >
        Siguiente
      </Button>
    </div>
  );
}
