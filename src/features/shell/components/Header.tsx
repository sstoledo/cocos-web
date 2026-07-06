import { cn } from '@/lib/utils';
import { IconMenu2 } from '@tabler/icons-react';

export type HeaderProps = {
  title: string;
  onMenuClick?: () => void;
  className?: string;
};

export function Header({ title, onMenuClick, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b bg-card px-4',
        className
      )}
    >
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        >
          <IconMenu2 className="h-5 w-5" />
        </button>
      )}
    </header>
  );
}
