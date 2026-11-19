import type { Ubigeo } from '../types';

/**
 * `Miraflores, Lima, Lima (150122)`. The district alone repeats across
 * departments, so province and department disambiguate, and the code stays
 * visible because it is what the CPE actually carries.
 */
export function formatUbigeoLabel(ubigeo: Ubigeo): string {
  return `${ubigeo.district}, ${ubigeo.province}, ${ubigeo.department} (${ubigeo.code})`;
}
