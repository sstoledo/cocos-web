import { Button } from '@/components/ui/Button';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { Link, useNavigate, useParams } from 'react-router';
import { UserForm } from '../components/UserForm';
import { useCreateUser } from '../hooks/use-create-user';
import { useUpdateUser } from '../hooks/use-update-user';
import { useUser } from '../hooks/use-user';
import type { UserFormValues } from '../schemas/user-schema';
import type { UserUpdateValues } from '../schemas/user-update-schema';

export function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const { data: user, isLoading, error } = useUser(id ?? '');

  const handleSubmit = async (values: UserFormValues | UserUpdateValues) => {
    try {
      if (id) {
        await updateUser.mutateAsync({ id, payload: values });
      } else if ('password' in values) {
        await createUser.mutateAsync(values);
      } else {
        return;
      }
      navigate('/users');
    } catch {
      // Surfaced through createUser.isError / updateUser.isError
    }
  };

  if (isEdit && isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando…
      </output>
    );
  }

  if (isEdit && (error || !user)) {
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

  const defaultValues = isEdit
    ? {
        name: user?.name ?? '',
        email: user?.email ?? '',
        roleId: user?.role.id ?? '',
        isActive: user?.isActive ?? true,
      }
    : {};

  const isPending = isEdit ? updateUser.isPending : createUser.isPending;

  return (
    <>
      <PageHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <PageTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</PageTitle>
          </div>
          <Link to="/users">
            <Button variant="outline">Volver</Button>
          </Link>
        </div>
      </PageHeader>
      <PageContent>
        <SectionCard title={isEdit ? 'Editar usuario' : 'Crear usuario'}>
          {(isEdit ? updateUser.isError : createUser.isError) && (
            <p className="mb-4 text-sm text-destructive" role="alert">
              No se pudo guardar el usuario. Revisá los datos e intentá de
              nuevo.
            </p>
          )}
          <UserForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isPending={isPending}
            isEdit={isEdit}
          />
        </SectionCard>
      </PageContent>
    </>
  );
}
