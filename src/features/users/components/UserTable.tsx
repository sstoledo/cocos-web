import { Button } from '@/components/ui/Button';
import { Link } from 'react-router';
import type { User } from '../types';

export type UserTableProps = {
  users: User[];
  onDelete: (id: string) => void;
  onAssignRole: (id: string) => void;
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function UserCog({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function Trash2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

export function UserTable({ users, onDelete, onAssignRole }: UserTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {['Nombre', 'Email', 'Rol', 'Estado', 'Creado', 'Acciones'].map(
                (header) => (
                  <th
                    key={header}
                    className="h-11 px-3 text-caption font-semibold text-muted-foreground"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  <Link
                    to={`/users/${user.id}`}
                    className="text-primary hover:underline"
                  >
                    {user.name}
                  </Link>
                </td>
                <td className="px-3">{user.email}</td>
                <td className="px-3 capitalize">{user.role.name}</td>
                <td className="px-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${
                      user.isActive
                        ? 'bg-success text-success-foreground'
                        : 'bg-destructive text-destructive-foreground'
                    }`}
                  >
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-3">{formatDate(user.createdAt)}</td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAssignRole(user.id)}
                      className="h-8 w-8"
                      title="Asignar rol"
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user.id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <article
            key={user.id}
            data-testid="user-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  to={`/users/${user.id}`}
                  className="text-body-sm font-medium text-primary hover:underline"
                >
                  {user.name}
                </Link>
                <p className="text-caption text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${
                  user.isActive
                    ? 'bg-success text-success-foreground'
                    : 'bg-destructive text-destructive-foreground'
                }`}
              >
                {user.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-caption text-muted-foreground">
              <span className="capitalize">{user.role.name}</span>
              <span>Creado {formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAssignRole(user.id)}
                className="h-8 w-8"
                title="Asignar rol"
              >
                <UserCog className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(user.id)}
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>

      {users.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No hay usuarios registrados.
        </p>
      )}
    </>
  );
}
