import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { buildProforma } from '../test/fixtures';
import { ProformaTable } from './ProformaTable';

describe('ProformaTable', () => {
  it('renders desktop data and detail links', () => {
    render(
      <MemoryRouter>
        <ProformaTable proformas={[buildProforma()]} />
      </MemoryRouter>
    );

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent)
    ).toEqual([
      'N° Proforma',
      'Fecha',
      'Cliente',
      'Total',
      'Estado',
      'Acciones',
    ]);
    expect(
      screen.getByRole('cell', { name: 'PRO-2026-000001' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '80.50' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /ver/i })[0]).toHaveAttribute(
      'href',
      '/proformas/prof1'
    );
  });

  it('renders the approved mobile proforma card', () => {
    render(
      <MemoryRouter>
        <ProformaTable proformas={[buildProforma()]} />
      </MemoryRouter>
    );

    const card = screen.getByTestId('proforma-mobile-card');
    expect(card).toHaveTextContent('PRO-2026-000001');
    expect(card).toHaveTextContent('Juan Pérez');
    expect(card).toHaveTextContent('Borrador');
    expect(card).toHaveTextContent('80.50');
  });

  it('keeps the empty state', () => {
    render(
      <MemoryRouter>
        <ProformaTable proformas={[]} />
      </MemoryRouter>
    );

    expect(
      screen.getByText('No se encontraron proformas.')
    ).toBeInTheDocument();
  });
});
