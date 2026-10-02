import { toCents } from '@/lib/cents';

// Sign detection only — no arithmetic. Negative values carry a '-' prefix
// in the DTO; zero/positive amounts parse through the cents helper.
export function differenceClassName(difference: string): string {
  if (difference.startsWith('-')) {
    return 'text-destructive';
  }
  if (toCents(difference) === 0) {
    return 'text-foreground';
  }
  return 'text-green-700 dark:text-green-400';
}
