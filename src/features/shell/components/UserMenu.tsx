import { Button } from '@/components/ui/Button';
import { IconLogout, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useLogout } from '../hooks/useLogout';

type UserMenuProps = {
  name: string;
  email: string;
  compact?: boolean;
  dropdown?: boolean;
};

export function UserMenu({
  name,
  email,
  compact = false,
  dropdown = false,
}: UserMenuProps) {
  const { mutate: logout, isPending } = useLogout();
  const [open, setOpen] = useState(false);

  if (dropdown) {
    return (
      <div className="relative">
        <button
          type="button"
          aria-label="Abrir menú de perfil"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconUser className="h-5 w-5" />
        </button>
        {open && (
          <div
            role="menu"
            aria-label="Menú de perfil"
            className="absolute right-0 top-11 z-50 w-56 rounded-md border border-border bg-card p-1 text-foreground shadow-lg"
          >
            <div className="border-b border-border px-3 py-2">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-sm px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Perfil
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={isPending}
              onClick={() => logout()}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <IconLogout className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    );
  }

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
