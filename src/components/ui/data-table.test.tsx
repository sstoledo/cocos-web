import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable, DataTableRow } from './data-table';

describe('DataTable', () => {
  function renderTable(size?: 'body' | 'caption') {
    render(
      <DataTable
        size={size}
        headers={[
          { label: 'Nombre' },
          { label: 'Total', className: 'text-right' },
        ]}
      >
        <DataTableRow>
          <td>Cambio de aceite</td>
          <td>150.00</td>
        </DataTableRow>
      </DataTable>
    );
  }

  it('renders the shared list-table shell', () => {
    renderTable();

    const container = screen.getByRole('table').closest('div');
    expect(container).toHaveClass('rounded-lg', 'border', 'bg-card');
    expect(screen.getByRole('table')).toHaveClass('w-full', 'caption-bottom');
  });

  it('renders headers with the shared th classes plus per-column extras', () => {
    renderTable();

    const nameHeader = screen
      .getByRole('columnheader', { name: 'Nombre' })
      .closest('th');
    expect(nameHeader).toHaveClass('h-11', 'px-3', 'text-caption');
    expect(nameHeader).not.toHaveClass('text-right');

    const totalHeader = screen
      .getByRole('columnheader', { name: 'Total' })
      .closest('th');
    expect(totalHeader).toHaveClass('text-right');
  });

  it('defaults to the body-sm text size', () => {
    renderTable();

    expect(screen.getByRole('table')).toHaveClass('text-body-sm');
  });

  it('supports the caption text size variant', () => {
    renderTable('caption');

    expect(screen.getByRole('table')).toHaveClass('text-caption');
    expect(screen.getByRole('table')).not.toHaveClass('text-body-sm');
  });

  it('derives the header font size from the size variant', () => {
    renderTable('caption');

    const nameHeader = screen
      .getByRole('columnheader', { name: 'Nombre' })
      .closest('th');
    expect(nameHeader).not.toHaveClass('text-caption');
  });

  it('styles body rows with the shared row classes', () => {
    renderTable();

    const row = screen.getAllByRole('row')[1].closest('tr');
    expect(row).toHaveClass('h-14', 'border-b', 'border-border');
    expect(row).toHaveClass(
      'transition-colors',
      'last:border-0',
      'hover:bg-muted/50'
    );
  });
});
