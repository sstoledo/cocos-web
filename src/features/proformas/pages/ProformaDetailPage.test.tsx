import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildProforma } from '../test/fixtures';
import { ProformaDetailPage } from './ProformaDetailPage';

const { useProformaMock, useUserMock, convertMutateMock } = vi.hoisted(() => ({
  useProformaMock: vi.fn(),
  useUserMock: vi.fn(),
  convertMutateMock: vi.fn(),
}));

vi.mock('../hooks/use-proforma', () => ({
  useProforma: () => useProformaMock(),
}));
vi.mock('../hooks/use-convert-proforma', () => ({
  useConvertProforma: () => ({
    mutate: convertMutateMock,
    isPending: false,
  }),
}));
vi.mock('@/features/shell/hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

const acceptedProforma = buildProforma({
  status: 'accepted',
  notes: 'Entrega coordinada para el 28/10. Precios válidos por 15 días.',
});

function renderDetail(proforma = acceptedProforma) {
  useProformaMock.mockReturnValue({
    data: proforma,
    isLoading: false,
    error: null,
  });
  return render(
    <MemoryRouter>
      <ProformaDetailPage />
    </MemoryRouter>
  );
}

describe('ProformaDetailPage', () => {
  beforeEach(() => {
    useProformaMock.mockReset();
    convertMutateMock.mockReset();
    useUserMock.mockReturnValue({
      user: {
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@example.com',
        role: { id: 'role-1', name: 'Admin' },
      },
      isLoading: false,
      error: null,
    });
  });

  it('renders the approved accepted detail, mobile lines and conversion panel', async () => {
    renderDetail();

    expect(
      await screen.findByTestId('proforma-line-mobile-card')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Volver a proformas' })
    ).toHaveAttribute('href', '/proformas');
    expect(screen.getByText('Información de la proforma')).toBeInTheDocument();
    expect(
      screen.getByText(acceptedProforma.notes as string)
    ).toBeInTheDocument();
    expect(screen.getByTestId('proforma-line-mobile-card')).toHaveTextContent(
      'PRD-001'
    );
    expect(screen.getByTestId('proforma-total-value')).toHaveTextContent(
      '80.50'
    );
    expect(screen.getByTestId('proforma-pdf-action')).toHaveClass(
      'w-full',
      'sm:w-auto'
    );
    expect(screen.getByText('Confirmación requerida')).toBeInTheDocument();
    expect(
      screen.getByText(
        'La conversión es irreversible y consumirá stock FIFO. Verifica los productos y confirma el método de pago antes de continuar.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Opciones: Efectivo / Tarjeta / Transferencia')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Método de pago')).toHaveValue('cash');
  });

  it('keeps the existing confirmation and cash conversion behavior', async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(
      await screen.findByRole('button', { name: 'Convertir a venta' })
    );
    await user.click(screen.getByRole('button', { name: 'Convertir' }));

    expect(convertMutateMock).toHaveBeenCalledWith(
      { id: acceptedProforma.id, payload: { paymentMethod: 'cash' } },
      expect.objectContaining({ onError: expect.any(Function) })
    );
  });

  it('does not show conversion for a non-accepted proforma', () => {
    renderDetail(buildProforma({ status: 'draft' }));

    expect(
      screen.queryByRole('button', { name: 'Convertir a venta' })
    ).not.toBeInTheDocument();
  });
});
