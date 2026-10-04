import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PresentationFormPage } from './PresentationFormPage';

const mockPresentation = {
  id: 'p1',
  name: 'Presentación Existente',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

vi.mock('../hooks/use-presentation', () => ({
  usePresentation: vi.fn(),
}));

vi.mock('../hooks/use-create-presentation', () => ({
  useCreatePresentation: vi.fn(),
}));

vi.mock('../hooks/use-update-presentation', () => ({
  useUpdatePresentation: vi.fn(),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

import { useNavigate, useParams } from 'react-router';
import { useCreatePresentation } from '../hooks/use-create-presentation';
import { usePresentation } from '../hooks/use-presentation';
import { useUpdatePresentation } from '../hooks/use-update-presentation';

function renderPage(
  path: string,
  overrides: {
    presentation?: typeof mockPresentation | undefined;
    isLoadingPresentation?: boolean;
    presentationError?: Error | null;
    createMutation?: {
      mutate: ReturnType<typeof vi.fn>;
      isPending: boolean;
      error: Error | null;
    };
    updateMutation?: {
      mutate: ReturnType<typeof vi.fn>;
      isPending: boolean;
      error: Error | null;
    };
    params?: { id?: string };
  } = {}
) {
  const {
    presentation,
    isLoadingPresentation = false,
    presentationError = null,
    createMutation = { mutate: vi.fn(), isPending: false, error: null },
    updateMutation = { mutate: vi.fn(), isPending: false, error: null },
    params = {},
  } = overrides;

  (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue(params);
  (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());

  (usePresentation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    data: presentation,
    isLoading: isLoadingPresentation,
    error: presentationError,
  });

  (
    useCreatePresentation as unknown as ReturnType<typeof vi.fn>
  ).mockReturnValue(createMutation);
  (
    useUpdatePresentation as unknown as ReturnType<typeof vi.fn>
  ).mockReturnValue(updateMutation);

  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={new QueryClient()}>
        <PresentationFormPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('PresentationFormPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('renders "Nueva presentación" title in create mode', () => {
    renderPage('/presentations/new', { params: {} });

    expect(screen.getByText('Nueva presentación')).toBeInTheDocument();
  });

  it('renders "Editar presentación" title in edit mode', () => {
    renderPage('/presentations/p1/edit', {
      presentation: mockPresentation,
      params: { id: 'p1' },
    });

    expect(screen.getByText('Editar presentación')).toBeInTheDocument();
  });

  it('prefills form in edit mode', () => {
    renderPage('/presentations/p1/edit', {
      presentation: mockPresentation,
      params: { id: 'p1' },
    });

    expect(screen.getByLabelText('Nombre')).toHaveValue(
      'Presentación Existente'
    );
  });

  it('shows loading state while fetching presentation in edit mode', () => {
    renderPage('/presentations/p1/edit', {
      isLoadingPresentation: true,
      params: { id: 'p1' },
    });

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('shows error when presentation fetch fails in edit mode', () => {
    renderPage('/presentations/p1/edit', {
      presentationError: new Error('Failed'),
      params: { id: 'p1' },
    });

    expect(
      screen.getByText(
        'No se pudieron cargar los datos. Intentá de nuevo más tarde.'
      )
    ).toBeInTheDocument();
  });

  it('shows create mutation error', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed');
    const createMutation = {
      mutate: vi.fn((_values, options) => {
        options?.onError?.(error);
      }),
      isPending: false,
      error,
    };

    renderPage('/presentations/new', { createMutation, params: {} });

    await user.type(screen.getByLabelText('Nombre'), 'Presentación');
    await user.click(
      screen.getByRole('button', { name: 'Crear presentación' })
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          'No se pudo crear la presentación. Intentá de nuevo más tarde.'
        )
      ).toBeInTheDocument()
    );
  });

  it('shows update mutation error', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed');
    const updateMutation = {
      mutate: vi.fn((_values, options) => {
        options?.onError?.(error);
      }),
      isPending: false,
      error,
    };

    renderPage('/presentations/p1/edit', {
      presentation: mockPresentation,
      updateMutation,
      params: { id: 'p1' },
    });

    await user.type(
      screen.getByLabelText('Nombre'),
      'Presentación Actualizada'
    );
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(
        screen.getByText(
          'No se pudo actualizar la presentación. Intentá de nuevo más tarde.'
        )
      ).toBeInTheDocument()
    );
  });
});
