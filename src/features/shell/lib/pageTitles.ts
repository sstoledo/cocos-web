const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Productos',
  '/lots': 'Lotes',
  '/clients': 'Clientes',
  '/services': 'Servicios',
  '/work-orders': 'Órdenes de trabajo',
  '/sales': 'Ventas',
  '/sales/:id': 'Detalle de venta',
  '/sales/new': 'Nueva venta',
  '/refunds': 'Devoluciones',
  '/purchase-orders': 'Órdenes de compra',
  '/notifications': 'Notificaciones',
  '/users': 'Usuarios',
  '/cash-closing': 'Cierre de caja',
};

export function getPageTitle(path: string): string {
  if (titles[path]) {
    return titles[path];
  }

  for (const [pattern, title] of Object.entries(titles)) {
    if (!pattern.includes(':')) {
      continue;
    }
    const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '[^/]+')}$`);
    if (regex.test(path)) {
      return title;
    }
  }

  return '';
}
