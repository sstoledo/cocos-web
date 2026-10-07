import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Label } from '@/components/ui/Label';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { Select } from '@/components/ui/Select';
import { useRoles } from '@/features/auth/hooks/use-roles';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';
import { useAssignRole } from '../hooks/use-assign-role';
import { useDeleteUser } from '../hooks/use-delete-user';
import { useUser } from '../hooks/use-user';
import { assignRoleSchema } from '../schemas/assign-role-schema';
import type { AssignRoleValues } from '../schemas/assign-role-schema';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = id ?? '';
  const { data: user, isLoading, error } = useUser(userId);
  const assignRole = useAssignRole();
  const deleteUser = useDeleteUser();
  const { roles } = useRoles();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const assignRoleForm = useForm<AssignRoleValues>({
    resolver: zodResolver(assignRoleSchema),
    defaultValues: { roleId: '' },
  });

  const handleAssignRole = async (values: AssignRoleValues) => {
    try {
      await assignRole.mutateAsync({ id: userId, payload: values });
      assignRoleForm.reset({ roleId: values.roleId });
    } catch {
      // Surfaced through assignRole.isError below
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser.mutateAsync(userId);
      navigate('/users');
    } catch {
      // Surfaced through deleteUser.isError below
    }
  };

  if (!id) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Usuario no encontrado.
      </output>
    );
  }

  if (isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando…
      </output>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          No se pudieron cargar los datos. Intentá de nuevo más tarde.
        </div>
      </div>
    );
  }

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  return (
    <>
      <PageHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <PageTitle>{user.name}</PageTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              {user.isActive ? 'Activo' : 'Inactivo'}
            </span>
            <Link to={`/users/${user.id}/edit`}>
              <Button variant="outline">Editar</Button>
            </Link>
          </div>
        </div>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del usuario">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Nombre</dt>
              <dd className="text-foreground">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="text-foreground">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Rol</dt>
              <dd className="text-foreground capitalize">{user.role.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Estado</dt>
              <dd className="text-foreground">
                {user.isActive ? 'Activo' : 'Inactivo'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Creado</dt>
              <dd className="text-foreground">{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Actualizado</dt>
              <dd className="text-foreground">{formatDate(user.updatedAt)}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Cambiar rol">
          <form
            onSubmit={assignRoleForm.handleSubmit(handleAssignRole)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="roleId">Nuevo rol</Label>
              <Select
                id="roleId"
                options={roleOptions}
                disabled={assignRole.isPending}
                placeholder="Seleccionar rol"
                aria-invalid={
                  assignRoleForm.formState.errors.roleId ? 'true' : 'false'
                }
                error={assignRoleForm.formState.errors.roleId?.message}
                {...assignRoleForm.register('roleId')}
              />
              {assignRoleForm.formState.errors.roleId && (
                <p className="text-sm text-destructive" role="alert">
                  {assignRoleForm.formState.errors.roleId.message}
                </p>
              )}
            </div>
            {assignRole.isError && (
              <p className="text-sm text-destructive" role="alert">
                No se pudo asignar el rol. Intentá de nuevo más tarde.
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={
                  assignRole.isPending || assignRoleForm.formState.isSubmitting
                }
              >
                {assignRole.isPending ? 'Asignando...' : 'Asignar rol'}
              </Button>
            </div>
          </form>
        </SectionCard>

        {deleteUser.isError && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            No se pudo eliminar el usuario. Intentá de nuevo más tarde.
          </p>
        )}
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={deleteUser.isPending}
          className={cn(
            'mt-4',
            'border-destructive/50 text-destructive hover:bg-destructive/10'
          )}
        >
          {deleteUser.isPending ? 'Eliminando...' : 'Eliminar usuario'}
        </Button>
      </PageContent>
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Eliminar usuario"
        description={`¿Eliminar al usuario ${user.name}? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </>
  );
}
