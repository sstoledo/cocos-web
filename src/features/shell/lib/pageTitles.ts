const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Productos',
  '/lots': 'Lotes',
  '/clients': 'Clientes',
  '/services': 'Servicios',
  '/work-orders': 'Órdenes de trabajo',
  '/sales': 'Ventas',
  '/refunds': 'Devoluciones',
  '/purchase-orders': 'Órdenes de compra',
  '/notifications': 'Notificaciones',
  '/users': 'Usuarios',
  '/cash-closing': 'Cierre de caja',
};

export function getPageTitle(path: string): string {
  return titles[path] ?? '';
}
