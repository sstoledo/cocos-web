import { describe, expect, it } from 'vitest';
import type { RoleName } from '../types';
import { getDefaultRouteForRole } from './defaultRoute';

describe('getDefaultRouteForRole', () => {
  it('returns /work-orders for Mechanic', () => {
    expect(getDefaultRouteForRole('Mechanic')).toBe('/work-orders');
  });

  it('returns /dashboard for the remaining roles', () => {
    const roles: RoleName[] = [
      'Admin',
      'Reception',
      'Warehouse',
      'Purchasing',
      'ReadOnly',
    ];

    for (const role of roles) {
      expect(getDefaultRouteForRole(role)).toBe('/dashboard');
    }
  });
});
