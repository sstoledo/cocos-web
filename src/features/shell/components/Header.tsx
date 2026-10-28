import { cn } from '@/lib/utils';
import { IconMenu2 } from '@tabler/icons-react';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export type HeaderProps = {
  title: string;
  userName: string;
  userEmail: string;
  onMenuClick?: () => void;
  className?: string;
};

export function Header({
  title,
  userName,
  userEmail,
  onMenuClick,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b bg-card px-4',
        className
      )}
    >
      <div className="flex items-center gap-2">
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
        <span className="font-display text-lg font-semibold text-foreground lg:hidden">
          Cocos
        </span>
        <span className="sr-only">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
        <UserMenu name={userName} email={userEmail} dropdown />
      </div>
    </header>
  );
}
