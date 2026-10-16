import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OpenContainersInfo } from '../types';
import { useOpenContainers } from './use-open-containers';

const openContainers: OpenContainersInfo = {
  productId: 'p1',
  openContainers: 2,
  lastOpened: {
    workOrderId: 'wo1',
    workOrderNumber: 'OT-0001',
    registeredBy: { id: 'u1', name: 'Ana García' },
    createdAt: '2024-01-15T10:00:00.000Z',
  },
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useOpenContainers', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches open containers for the product', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => openContainers,
    });

    const { result } = renderHook(() => useOpenContainers('p1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/stock/products/p1/open-containers',
      { credentials: 'include' }
    );
    expect(result.current.data).toEqual(openContainers);
  });

  it('does not fetch when disabled', () => {
    globalThis.fetch = vi.fn();

    const { result } = renderHook(() => useOpenContainers('p1', false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
