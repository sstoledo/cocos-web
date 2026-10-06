import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useRoles } from '@/features/auth/hooks/use-roles';
import type { UserListFilters } from '../types';

interface UserFiltersProps {
  filters: UserListFilters;
  onChange: (filters: UserListFilters) => void;
}

export function UserFilters({ filters, onChange }: UserFiltersProps) {
  const { roles, isLoading } = useRoles();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, q: e.target.value || undefined });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, roleId: e.target.value || undefined });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...filters,
      isActive: (e.target.value as 'true' | 'false') || undefined,
    });
  };

  const handleClear = () => {
    onChange({});
  };

  const hasFilters = Boolean(filters.q || filters.roleId || filters.isActive);

  const roleOptions = [
    { value: '', label: 'Todos los roles' },
    ...roles.map((role) => ({ value: role.id, label: role.name })),
  ];

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={filters.q ?? ''}
          onChange={handleSearchChange}
          className="flex h-10 w-full max-w-xs appearance-none rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="min-w-[180px]">
        <Select
          value={filters.roleId ?? ''}
          onChange={handleRoleChange}
          options={roleOptions}
          disabled={isLoading}
          placeholder="Todos los roles"
        />
      </div>

      <div className="min-w-[150px]">
        <Select
          value={filters.isActive ?? ''}
          onChange={handleStatusChange}
          options={statusOptions}
          placeholder="Todos"
        />
      </div>

      {hasFilters && (
        <Button variant="outline" size="sm" onClick={handleClear}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
