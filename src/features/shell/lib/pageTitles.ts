const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Productos',
  '/products/new': 'Nuevo producto',
  '/products/:id/edit': 'Editar producto',
  '/lots': 'Lotes',
  '/clients': 'Clientes',
  '/services': 'Servicios',
  '/services/new': 'Nuevo servicio',
  '/services/:id/edit': 'Editar servicio',
  '/work-orders': 'Órdenes de trabajo',
  '/sales': 'Ventas',
  '/sales/:id': 'Detalle de venta',
  '/sales/new': 'Nueva venta',
  '/refunds': 'Devoluciones',
  '/purchase-orders': 'Órdenes de compra',
  '/purchase-orders/new': 'Nueva orden de compra',
  '/purchase-orders/:id': 'Detalle de orden de compra',
  '/purchase-orders/:id/edit': 'Editar orden de compra',
  '/purchase-orders/:id/receive': 'Recibir orden de compra',
  '/notifications': 'Notificaciones',
  '/users': 'Usuarios',
  '/cash-closings': 'Cierres de caja',
  '/cash-closings/close': 'Cierre de caja',
  '/cash-closings/:id': 'Detalle de cierre',
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
