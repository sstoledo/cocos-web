import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type DataTableVariant = 'card' | 'page' | 'section' | 'detail';

export type DataTableHeader = {
  /** Column label; unique within the table (also used as React key). */
  label: string;
  /** Extra classes for this column's th (e.g. a width or alignment hint). */
  className?: string;
};

export type DataTableProps = {
  headers: DataTableHeader[];
  /** Body rows. */
  children: ReactNode;
  /** Table text size; matches the two skeletons that exist today. */
  size?: 'body' | 'caption';
  /** Shell skeleton. card = bordered list card (list pages), page =
   * line-item table on a detail page, section/detail = tables inside
   * SectionCards. Defaults to card, matching all list tables. */
  variant?: DataTableVariant;
};

const CONTAINER_CLASSES: Record<DataTableVariant, string> = {
  card: 'hidden overflow-x-auto rounded-lg border bg-card md:block',
  page: 'hidden overflow-x-auto md:block',
  section: 'overflow-x-auto',
  detail: 'overflow-x-auto',
};

const TABLE_CLASSES = 'w-full caption-bottom';

const THEAD_CLASSES: Record<DataTableVariant, string> = {
  card: 'bg-muted',
  page: 'bg-muted',
  section: '',
  detail: '',
};

const HEADER_TR_CLASSES: Record<DataTableVariant, string> = {
  card: 'text-left',
  // The caption-size page tables keep their th row at the plain size,
  // so the font-size utility derives from `size` like the card variant.
  page: 'text-left font-semibold text-muted-foreground',
  section: 'border-b border-border text-left text-muted-foreground',
  detail: 'border-b border-border',
};

const TH_CLASSES: Record<DataTableVariant, string> = {
  card: 'h-11 px-3 font-semibold text-muted-foreground',
  page: 'px-3 py-2',
  section: 'px-3 py-2 font-medium',
  detail: 'text-left p-3 font-medium text-muted-foreground',
};

/** WorkOrderTable (the only caption-size list table today) keeps th
 * without text-caption, so the header font size derives from `size`. */
const TH_CLASSES_BODY = `${TH_CLASSES.card} text-caption`;

const ROW_CLASSES: Record<DataTableVariant, string> = {
  card: 'h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50',
  page: 'h-12 border-b border-border last:border-0',
  section: 'border-b border-border',
  detail: 'border-b border-border',
};

function headerRowClasses(variant: DataTableVariant, size: 'body' | 'caption') {
  const base = HEADER_TR_CLASSES[variant];
  if (variant === 'page' && size === 'body') {
    return `${base} text-caption`;
  }
  if (variant === 'card' && size === 'body') {
    return `${base} text-caption`;
  }
  return base;
}

/**
 * Shared table shell. Every feature table used to hand-copy one of
 * these skeletons; the primitive keeps class churn for a visual-pattern
 * change at one site.
 */
export function DataTable({
  headers,
  children,
  size = 'body',
  variant = 'card',
}: DataTableProps) {
  const thClasses =
    variant === 'card' && size === 'body'
      ? TH_CLASSES_BODY
      : TH_CLASSES[variant];
  return (
    <div className={CONTAINER_CLASSES[variant]}>
      <table
        className={cn(
          TABLE_CLASSES,
          size === 'body' ? 'text-body-sm' : 'text-caption'
        )}
      >
        <thead className={THEAD_CLASSES[variant]}>
          <tr className={headerRowClasses(variant, size)}>
            {headers.map((header) => (
              // The static shell classes are built by interpolation, not
              // cn(): tailwind-merge treats text-caption (a font-size
              // utility) as a text color and would drop it in favor of
              // text-muted-foreground. Only per-column extras are appended.
              <th
                key={header.label}
                className={
                  header.className
                    ? `${thClasses} ${header.className}`
                    : thClasses
                }
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** Shared body-row wrapper matching every table skeleton in the app. */
export function DataTableRow({
  children,
  className,
  variant = 'card',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  variant?: DataTableVariant;
  /** Row-level navigation convenience (CashClosingsListPage clickable rows). */
  onClick?: () => void;
}) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: rows stay navigable for keyboard/AT users via the real link inside the row; this onClick is a pointer-only convenience.
    <tr className={cn(ROW_CLASSES[variant], className)} onClick={onClick}>
      {children}
    </tr>
  );
}
