import { describe, expect, it, vi } from 'vitest';
import { UBIGEO_SEARCH_LIMIT, getUbigeos } from './get-ubigeos';

const MIRAFLORES = {
  code: '150122',
  department: 'Lima',
  province: 'Lima',
  district: 'Miraflores',
};

describe('getUbigeos', () => {
  it('searches the catalog with the term and a bounded limit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([MIRAFLORES]),
    });
    globalThis.fetch = fetchMock;

    const result = await getUbigeos('miraflores');

    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:4000/api/ubigeos?query=miraflores&limit=${UBIGEO_SEARCH_LIMIT}`,
      { credentials: 'include' }
    );
    expect(result).toEqual([MIRAFLORES]);
  });

  it('asks for the first page when the term is blank', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    globalThis.fetch = fetchMock;

    await getUbigeos('   ');

    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:4000/api/ubigeos?limit=${UBIGEO_SEARCH_LIMIT}`,
      { credentials: 'include' }
    );
  });

  it('throws when the response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

    await expect(getUbigeos('lima')).rejects.toThrow(
      'Failed to fetch ubigeos: 500'
    );
  });
});
