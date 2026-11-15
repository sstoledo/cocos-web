import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

describe('DataTable variants', () => {
  it.each([
    ['page', 'hidden overflow-x-auto md:block'],
    ['section', 'overflow-x-auto'],
    ['detail', 'overflow-x-auto'],
  ] as const)(
    '%s variant renders a bare container without the card border',
    (variant, expected) => {
      render(
        <DataTable variant={variant} headers={[{ label: 'Producto' }]}>
          <tr>
            <td>x</td>
          </tr>
        </DataTable>
      );

      const container = screen.getByRole('table').closest('div');
      expect(container).toHaveClass(expected.split(' ')[0]);
      expect(container).not.toHaveClass('rounded-lg');
      expect(container).not.toHaveClass('bg-card');
    }
  );

  it.each([
    ['page', 'px-3 py-2'],
    ['section', 'px-3 py-2 font-medium'],
    ['detail', 'text-left p-3 font-medium text-muted-foreground'],
  ] as const)('%s variant keeps its th classes', (variant, expected) => {
    render(
      <DataTable variant={variant} headers={[{ label: 'Producto' }]}>
        <tr>
          <td>x</td>
        </tr>
      </DataTable>
    );

    const th = screen.getByRole('columnheader', { name: 'Producto' });
    expect(th).toHaveClass(...expected.split(' '));
  });

  it('page variant keeps the muted thead; section and detail do not', () => {
    const first = render(
      <DataTable variant="page" headers={[{ label: 'A' }]}>
        <tr>
          <td>x</td>
        </tr>
      </DataTable>
    );
    expect(first.getByRole('table').querySelector('thead')).toHaveClass(
      'bg-muted'
    );
    first.unmount();

    const second = render(
      <DataTable variant="section" headers={[{ label: 'A' }]}>
        <tr>
          <td>x</td>
        </tr>
      </DataTable>
    );
    expect(second.getByRole('table').querySelector('thead')).not.toHaveClass(
      'bg-muted'
    );
    second.unmount();
  });

  it('page variant uses h-12 rows without hover', () => {
    render(
      <DataTable variant="page" headers={[{ label: 'A' }]}>
        <DataTableRow variant="page">
          <td>x</td>
        </DataTableRow>
      </DataTable>
    );

    const row = screen.getAllByRole('row')[1];
    expect(row).toHaveClass(
      'h-12',
      'border-b',
      'border-border',
      'last:border-0'
    );
    expect(row).not.toHaveClass('hover:bg-muted/50');
  });

  it('section and detail variants use plain border-b rows', () => {
    for (const variant of ['section', 'detail'] as const) {
      render(
        <DataTable variant={variant} headers={[{ label: 'A' }]}>
          <DataTableRow variant={variant}>
            <td>x</td>
          </DataTableRow>
        </DataTable>
      );
      const row = screen.getAllByRole('row')[1];
      expect(row).toHaveClass('border-b', 'border-border');
      expect(row).not.toHaveClass('h-14');
    }
  });

  it('card rows accept row-level onClick passthrough', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <DataTable headers={[{ label: 'A' }]}>
        <DataTableRow onClick={handleClick}>
          <td>x</td>
        </DataTableRow>
      </DataTable>
    );

    await user.click(screen.getAllByRole('row')[1]);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
