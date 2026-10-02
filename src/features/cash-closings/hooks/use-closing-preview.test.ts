import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClosingPreview } from '../types';
import { useClosingPreview } from './use-closing-preview';

const preview: ClosingPreview = {
  periodStart: '2026-09-23T00:00:00.000Z',
  expectedCash: '1250.00',
  expectedCard: '3400.50',
  expectedTransfer: '800.00',
  salesCount: 12,
};

function createWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useClosingPreview', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches the open-period preview', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => preview,
    });

    const { result } = renderHook(() => useClosingPreview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/cash-closings/preview',
      { credentials: 'include' }
    );
    expect(result.current.data).toEqual(preview);
  });

  it('caches under the preview key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => preview,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useClosingPreview(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(['cash-closings', 'preview'])).toEqual(
      preview
    );
  });

  it('handles an empty open period (periodStart null)', async () => {
    const emptyPreview: ClosingPreview = {
      periodStart: null,
      expectedCash: '0.00',
      expectedCard: '0.00',
      expectedTransfer: '0.00',
      salesCount: 0,
    };
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => emptyPreview,
    });

    const { result } = renderHook(() => useClosingPreview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(emptyPreview);
  });

  it('surfaces an ApiError when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Forbidden', errorCode: 'FORBIDDEN' }),
    });

    const { result } = renderHook(() => useClosingPreview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      status: 403,
      errorCode: 'FORBIDDEN',
    });
  });
});
