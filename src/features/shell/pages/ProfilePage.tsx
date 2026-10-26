import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '../hooks/useUser';

export function ProfilePage() {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-destructive">
        No se pudo cargar tu perfil.
      </p>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Perfil</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Datos de la cuenta">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Nombre</dt>
              <dd className="font-medium text-foreground">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Rol</dt>
              <dd className="font-medium text-foreground">{user.role.name}</dd>
            </div>
          </dl>
        </SectionCard>
      </PageContent>
    </>
  );
}
