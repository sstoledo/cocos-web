import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type DataTableHeader = {
  /** Column label; unique within the table (also used as React key). */
  label: string;
  /** Extra classes for this column's th (e.g. a width hint). */
  className?: string;
};

export type DataTableProps = {
  headers: DataTableHeader[];
  /** Body rows. */
  children: ReactNode;
  /** Table text size; matches the two skeletons that exist today. */
  size?: 'body' | 'caption';
};

const CONTAINER_CLASSES =
  'hidden overflow-x-auto rounded-lg border bg-card md:block';

const TABLE_CLASSES = 'w-full caption-bottom';

const TH_CLASSES = 'h-11 px-3 font-semibold text-muted-foreground';

/** WorkOrderTable (the only caption-size list table today) keeps th
 * without text-caption, so the header font size derives from `size`. */
const TH_CLASSES_BODY = `${TH_CLASSES} text-caption`;

/**
 * Shared list-table shell. Every feature table used to hand-copy this
 * wrapper; the primitive keeps class churn for a visual-pattern change
 * at one site.
 */
export function DataTable({
  headers,
  children,
  size = 'body',
}: DataTableProps) {
  const thClasses = size === 'body' ? TH_CLASSES_BODY : TH_CLASSES;
  return (
    <div className={CONTAINER_CLASSES}>
      <table
        className={cn(
          TABLE_CLASSES,
          size === 'body' ? 'text-body-sm' : 'text-caption'
        )}
      >
        <thead className="bg-muted">
          <tr className="text-left">
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

const ROW_CLASSES =
  'h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50';

/** Shared body-row wrapper matching every list table in the app. */
export function DataTableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tr className={cn(ROW_CLASSES, className)}>{children}</tr>;
}
