import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '../types';
import { ProductDetailPage } from './ProductDetailPage';

const product: Product = {
  id: 'p1',
  code: 'COD-001',
  name: 'Aceite 20W50',
  price: '25.00',
  isActive: true,
  presentation: { id: 'pres1', name: 'Litro' },
  brand: { id: 'brand1', name: 'Castrol' },
  category: { id: 'cat1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: ['/products/p1'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/products/:id',
            element: children,
          })
        )
      )
    );
  };
}

function mockFetch(role: string) {
  globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('/users/me')) {
      return {
        ok: true,
        json: async () => ({
          id: 'u1',
          name: 'Ana',
          email: 'ana@example.com',
          role: { id: 'r1', name: role },
        }),
      };
    }
    return { ok: true, json: async () => product };
  });
}

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(['Admin', 'Warehouse'])(
    'shows the edit link for %s',
    async (role) => {
      mockFetch(role);

      render(<ProductDetailPage />, { wrapper: createWrapper() });

      await waitFor(() =>
        expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
          'href',
          '/products/p1/edit'
        )
      );
    }
  );

  it('shows back navigation and a full-width mobile edit action', async () => {
    mockFetch('Admin');

    render(<ProductDetailPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: 'Volver a productos' })
      ).toHaveAttribute('href', '/products')
    );
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveClass(
      'w-full',
      'sm:w-auto'
    );
  });

  it.each(['Reception', 'Mechanic'])(
    'hides the edit link for %s',
    async (role) => {
      mockFetch(role);

      render(<ProductDetailPage />, { wrapper: createWrapper() });

      await waitFor(() =>
        expect(
          screen.getByRole('heading', { name: 'Aceite 20W50' })
        ).toBeInTheDocument()
      );
      expect(
        screen.queryByRole('link', { name: 'Editar' })
      ).not.toBeInTheDocument();
    }
  );
});
