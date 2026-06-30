import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold">Acceso denegado</h1>
      <p className="text-muted-foreground">
        No tenés permisos para ver esta sección.
      </p>
      <Button onClick={() => navigate('/dashboard')}>Volver al inicio</Button>
    </div>
  );
}
