import { Button } from '@/components/ui/Button';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate } from 'react-router';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader>
        <PageTitle className="text-h3 lg:text-h2">Acceso denegado</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Acceso denegado">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              No tenés permisos para ver esta sección.
            </p>
            <Button
              className="w-full sm:w-auto"
              onClick={() => navigate('/dashboard')}
            >
              Volver al inicio
            </Button>
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}
