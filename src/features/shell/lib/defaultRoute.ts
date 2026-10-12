import type { RoleName } from '../types';

export function getDefaultRouteForRole(role: RoleName): string {
  return role === 'Mechanic' ? '/work-orders' : '/dashboard';
}
