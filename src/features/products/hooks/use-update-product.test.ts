import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '../types';
import { useUpdateProduct } from './use-update-product';

const values = {
  code: 'COD-001',
  name: 'Aceite 20W50',
  price: 25,
  presentationId: 'p1',
  brandId: 'b1',
  categoryId: 'c1',
  isActive: true,
};

const updatedProduct: Product = {
  id: 'prod-1',
  code: values.code,
  name: values.name,
  price: '25.00',
  isActive: true,
  presentation: { id: 'p1', name: 'Litro' },
  brand: { id: 'b1', name: 'Castrol' },
  category: { id: 'c1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('useUpdateProduct', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a product without an image', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedProduct,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      );
    }

    const { result } = renderHook(() => useUpdateProduct(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'prod-1', values });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products/prod-1',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
      })
    );

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const formData = requestInit.body as FormData;
    expect(formData.get('code')).toBe(values.code);
    expect(formData.get('name')).toBe(values.name);
    expect(formData.get('price')).toBe(values.price.toString());
    expect(formData.get('presentationId')).toBe(values.presentationId);
    expect(formData.get('brandId')).toBe(values.brandId);
    expect(formData.get('categoryId')).toBe(values.categoryId);
    expect(formData.get('isActive')).toBe('true');
    expect(result.current.data).toEqual(updatedProduct);
  });

  it('updates a product with an image', async () => {
    const image = new File(['image content'], 'product.png', {
      type: 'image/png',
    });

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedProduct,
    });

    const { result } = renderHook(() => useUpdateProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'prod-1', values, image });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const formData = requestInit.body as FormData;
    expect(formData.get('image')).toBeInstanceOf(File);
    expect((formData.get('image') as File).name).toBe('product.png');
  });

  it('exposes the error when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useUpdateProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'prod-1', values });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('invalidates the product list and detail queries on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedProduct,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      );
    }

    const { result } = renderHook(() => useUpdateProduct(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'prod-1', values });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['products', 'list'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['products', 'detail', 'prod-1'],
    });
  });
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}
