import { Button } from '@/components/ui/Button';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { UserFilters } from '../components/UserFilters';
import { UserTable } from '../components/UserTable';
import { useDeleteUser } from '../hooks/use-delete-user';
import { useUsers } from '../hooks/use-users';
import type { UserListFilters } from '../types';

export function UserListPage() {
  const [filters, setFilters] = useState<UserListFilters>({});
  const [page, setPage] = useState(1);
  const limit = 20;
  const navigate = useNavigate();

  const { users, meta, isLoading, error } = useUsers({
    ...filters,
    page,
    limit,
  });
  const deleteUser = useDeleteUser();

  const handleDelete = async (id: string) => {
    const target = users.find((user) => user.id === id);
    const label = target?.name ?? 'este usuario';
    if (
      !window.confirm(`¿Eliminar a ${label}? Esta acción no se puede deshacer.`)
    ) {
      return;
    }
    try {
      await deleteUser.mutateAsync(id);
    } catch {
      // Error surfaced by the table's disabled state / toast layer
    }
  };

  const handleAssignRole = (id: string) => {
    navigate(`/users/${id}`);
  };

  return (
    <>
      <PageHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <PageTitle>Usuarios</PageTitle>
          <Link to="/users/new">
            <Button>Nuevo usuario</Button>
          </Link>
        </div>
      </PageHeader>
      <PageContent>
        <SectionCard title="Filtros" className="mb-4">
          <UserFilters
            filters={filters}
            onChange={(f) => {
              setFilters(f);
              setPage(1);
            }}
          />
        </SectionCard>

        <SectionCard title={`Usuarios (${meta?.total ?? 0})`}>
          {isLoading ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando…
            </output>
          ) : error ? (
            <div className="p-6">
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar los usuarios. Intentá de nuevo más tarde.
              </div>
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay usuarios registrados.
            </p>
          ) : (
            <>
              <UserTable
                users={users}
                onDelete={handleDelete}
                onAssignRole={handleAssignRole}
              />
              {meta && meta.total > limit && (
                <Pagination
                  meta={{
                    page,
                    total: meta.total,
                    totalPages: Math.ceil(meta.total / limit),
                  }}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}
