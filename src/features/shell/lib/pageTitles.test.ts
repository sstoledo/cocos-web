import { describe, expect, it } from 'vitest';
import { getPageTitle } from './pageTitles';

describe('getPageTitle', () => {
  it('returns titles for all guarded routes', () => {
    expect(getPageTitle('/dashboard')).toBe('Dashboard');
    expect(getPageTitle('/products')).toBe('Productos');
    expect(getPageTitle('/lots')).toBe('Lotes');
    expect(getPageTitle('/clients')).toBe('Clientes');
    expect(getPageTitle('/services')).toBe('Servicios');
    expect(getPageTitle('/work-orders')).toBe('Órdenes de trabajo');
    expect(getPageTitle('/sales')).toBe('Ventas');
    expect(getPageTitle('/refunds')).toBe('Devoluciones');
    expect(getPageTitle('/purchase-orders')).toBe('Órdenes de compra');
    expect(getPageTitle('/notifications')).toBe('Notificaciones');
    expect(getPageTitle('/users')).toBe('Usuarios');
    expect(getPageTitle('/cash-closing')).toBe('Cierre de caja');
  });

  it('returns an empty string for unknown paths', () => {
    expect(getPageTitle('/unknown')).toBe('');
    expect(getPageTitle('/')).toBe('');
  });
});
