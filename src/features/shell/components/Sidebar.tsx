import { cn } from '@/lib/utils';
import { NavLink } from 'react-router';
import { getAllowedNavItems } from '../lib/navigation';
import type { RoleName } from '../types';

type SidebarProps = {
  role: RoleName;
  className?: string;
};

export function Sidebar({ role, className }: SidebarProps) {
  const groups = getAllowedNavItems(role);

  return (
    <aside
      className={cn('flex h-full w-64 flex-col border-r bg-card', className)}
      aria-label="Navegación principal"
    >
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-semibold">Cocos</span>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        )
                      }
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
