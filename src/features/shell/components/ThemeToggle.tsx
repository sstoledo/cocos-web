import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const toggle = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle}>
      Toggle theme
    </Button>
  );
}
