import { Button } from '@/components/ui/Button';
import { IconLogout, IconUser } from '@tabler/icons-react';
import { useLogout } from '../hooks/useLogout';

type UserMenuProps = {
  name: string;
  email: string;
  compact?: boolean;
};

export function UserMenu({ name, email, compact = false }: UserMenuProps) {
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <IconUser className="h-4 w-4" />
      </div>
      {!compact && (
        <div className="hidden text-sm md:block">
          <p className="font-medium leading-none">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Cerrar sesión"
        onClick={() => logout()}
        disabled={isPending}
      >
        <IconLogout className="h-5 w-5" />
      </Button>
    </div>
  );
}
