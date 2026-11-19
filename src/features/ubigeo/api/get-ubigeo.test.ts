import { describe, expect, it, vi } from 'vitest';
import { getUbigeo } from './get-ubigeo';

const CALLAO = {
  code: '070101',
  department: 'Callao',
  province: 'Callao',
  district: 'Callao',
};

describe('getUbigeo', () => {
  it('fetches a single code with credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(CALLAO),
    });
    globalThis.fetch = fetchMock;

    await expect(getUbigeo('070101')).resolves.toEqual(CALLAO);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/ubigeos/070101',
      { credentials: 'include' }
    );
  });

  it('resolves to null when the code is unknown', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(getUbigeo('999999')).resolves.toBeNull();
  });

  it('throws on any other failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

    await expect(getUbigeo('150101')).rejects.toThrow(
      'Failed to fetch ubigeo: 500'
    );
  });
});
