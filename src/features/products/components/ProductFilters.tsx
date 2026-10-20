import { Input } from '@/components/ui/Input';
import { useProductReferences } from '../hooks/use-product-references';
import type { ProductListFilters, ProductReference } from '../types';

export type ProductFiltersProps = {
  filters: ProductListFilters;
  onChange: (filters: ProductListFilters) => void;
};

type StatusOption = {
  label: string;
  value: string;
};

const statusOptions: StatusOption[] = [
  { label: 'Todos', value: '' },
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' },
];

const selectClassName =
  'flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

type ReferenceSelectProps = {
  label: string;
  options: ProductReference[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

function ReferenceSelect({
  label,
  options,
  value,
  onChange,
}: ReferenceSelectProps) {
  return (
    <select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || undefined)}
      className={selectClassName}
      aria-label={label}
    >
      <option value="">Todas</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const { brands, categories, presentations } = useProductReferences();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      <div className="flex-1 sm:min-w-48">
        <Input
          type="search"
          placeholder="Buscar por nombre o código..."
          value={filters.q ?? ''}
          onChange={(event) =>
            onChange({ ...filters, q: event.target.value || undefined })
          }
          aria-label="Buscar productos"
        />
      </div>
      <div className="sm:w-40">
        <select
          value={
            filters.isActive === undefined ? '' : filters.isActive.toString()
          }
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              ...filters,
              isActive: value === '' ? undefined : value === 'true',
            });
          }}
          className={selectClassName}
          aria-label="Filtrar por estado"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:w-40">
        <ReferenceSelect
          label="Filtrar por marca"
          options={brands}
          value={filters.brandId}
          onChange={(brandId) => onChange({ ...filters, brandId })}
        />
      </div>
      <div className="sm:w-40">
        <ReferenceSelect
          label="Filtrar por categoría"
          options={categories}
          value={filters.categoryId}
          onChange={(categoryId) => onChange({ ...filters, categoryId })}
        />
      </div>
      <div className="sm:w-40">
        <ReferenceSelect
          label="Filtrar por presentación"
          options={presentations}
          value={filters.presentationId}
          onChange={(presentationId) =>
            onChange({ ...filters, presentationId })
          }
        />
      </div>
    </div>
  );
}
