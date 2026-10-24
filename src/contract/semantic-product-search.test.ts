import { describe, expect, it } from 'vitest';
import type { components, paths } from './api-types';

type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? true
  : never;

type SemanticQuery =
  paths['/api/products/search/semantic']['get']['parameters']['query'];
type LegacyProductQuery = NonNullable<
  paths['/api/products']['get']['parameters']['query']
>;

const _semanticQueryMatchesContract: Expect<
  Equal<SemanticQuery, { q: string; limit?: number; isActive?: boolean }>
> = true;

// S5: semantic search is additive; the legacy ILIKE q filter stays unchanged.
const _legacyProductQueryIsUnchanged: Expect<
  Equal<LegacyProductQuery, { q?: string; isActive?: boolean }>
> = true;

const _reindexResponseMatchesContract: Expect<
  Equal<
    components['schemas']['ReindexEmbeddingsResponse'],
    { updated: number; failed: number; totalMissing: number }
  >
> = true;

const contractAssertions = [
  _semanticQueryMatchesContract,
  _legacyProductQueryIsUnchanged,
  _reindexResponseMatchesContract,
];

describe('semantic product search OpenAPI contract', () => {
  it('keeps semantic search additive and preserves legacy product search', () => {
    expect(contractAssertions.every((assertion) => assertion === true)).toBe(
      true
    );
  });
});
