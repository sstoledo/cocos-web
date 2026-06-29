import { Button } from '@/components/ui/Button';
import { IconMoon, IconSun } from '@tabler/icons-react';
import * as React from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggle}
    >
      {isDark ? (
        <IconSun className="h-5 w-5" data-testid="sun-icon" />
      ) : (
        <IconMoon className="h-5 w-5" data-testid="moon-icon" />
      )}
    </Button>
  );
}
