import { describe, expect, it } from 'vitest';
import { isRouteAllowed } from './navigation';

describe('isRouteAllowed', () => {
  it('blocks /dashboard for Mechanic', () => {
    expect(isRouteAllowed('Mechanic', '/dashboard')).toBe(false);
  });

  it('allows /dashboard for Admin', () => {
    expect(isRouteAllowed('Admin', '/dashboard')).toBe(true);
  });

  it('allows /work-orders for Mechanic', () => {
    expect(isRouteAllowed('Mechanic', '/work-orders')).toBe(true);
  });

  it('allows unknown routes for any role', () => {
    expect(isRouteAllowed('Mechanic', '/not-a-nav-item')).toBe(true);
  });
});
