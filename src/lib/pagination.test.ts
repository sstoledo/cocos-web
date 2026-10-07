import { describe, expect, it } from 'vitest';
import { toPaginationMeta } from './pagination';

describe('toPaginationMeta', () => {
  it('computes totalPages from total and limit', () => {
    expect(toPaginationMeta({ page: 1, limit: 10, total: 25 })).toEqual({
      page: 1,
      total: 25,
      totalPages: 3,
    });
  });

  it('keeps the current page', () => {
    const meta = toPaginationMeta({ page: 3, limit: 10, total: 25 });

    expect(meta.page).toBe(3);
    expect(meta.totalPages).toBe(3);
  });

  it('returns zero pages when there is no data', () => {
    expect(toPaginationMeta({ page: 1, limit: 10, total: 0 }).totalPages).toBe(
      0
    );
  });

  it('returns zero pages when the limit is not positive', () => {
    expect(toPaginationMeta({ page: 1, limit: 0, total: 25 }).totalPages).toBe(
      0
    );
  });
});
