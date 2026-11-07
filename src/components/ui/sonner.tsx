import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { useAppTheme } from '@/lib/use-app-theme';

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useAppTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          /* Toast surface follows the approved Pen tokens: card is the
             popover-equivalent surface; --popover never existed here. */
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--card-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--card)',
          '--success-text': 'var(--card-foreground)',
          '--success-border': 'var(--border)',
          '--warning-bg': 'var(--card)',
          '--warning-text': 'var(--card-foreground)',
          '--warning-border': 'var(--border)',
          '--error-bg': 'var(--card)',
          '--error-text': 'var(--card-foreground)',
          '--error-border': 'var(--border)',
          '--info-bg': 'var(--card)',
          '--info-text': 'var(--card-foreground)',
          '--info-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
