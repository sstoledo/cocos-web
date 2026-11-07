import { useEffect, useState } from 'react';

/**
 * Resolves the app theme the way the rest of the app does: the `.dark`
 * class on <html>, set by the boot script in index.html and toggled by
 * ThemeToggle. Sonner's theme="system" follows the OS instead, which
 * desyncs when the user picks the opposite theme manually.
 */
export function useAppTheme(): 'light' | 'dark' {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark ? 'dark' : 'light';
}
