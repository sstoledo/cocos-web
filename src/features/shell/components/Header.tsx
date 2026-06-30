import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

type HeaderProps = {
  name: string;
  email: string;
};

export function Header({ name, email }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <span className="font-semibold md:hidden">Cocos</span>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu name={name} email={email} />
      </div>
    </header>
  );
}
