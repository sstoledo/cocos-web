import {
  IconBell,
  IconCash,
  IconCashRegister,
  IconLayoutDashboard,
  IconPackage,
  IconPackages,
  IconReceiptRefund,
  IconTool,
  IconTools,
  IconTruckDelivery,
  IconUserCog,
  IconUsers,
} from '@tabler/icons-react';

import type { NavGroup, RoleName } from '../types';

export const navigationGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: IconLayoutDashboard,
        allowedRoles: [
          'Admin',
          'Reception',
          'Mechanic',
          'Warehouse',
          'Purchasing',
          'ReadOnly',
        ],
      },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      {
        label: 'Productos',
        path: '/products',
        icon: IconPackage,
        allowedRoles: ['Admin', 'Warehouse'],
      },
      {
        label: 'Lotes',
        path: '/lots',
        icon: IconPackages,
        allowedRoles: ['Admin', 'Warehouse', 'Purchasing'],
      },
      {
        label: 'Servicios',
        path: '/services',
        icon: IconTool,
        allowedRoles: ['Admin'],
      },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      {
        label: 'Clientes',
        path: '/clients',
        icon: IconUsers,
        allowedRoles: ['Admin', 'Reception'],
      },
      {
        label: 'Órdenes de trabajo',
        path: '/work-orders',
        icon: IconTools,
        allowedRoles: ['Admin', 'Reception', 'Mechanic'],
      },
      {
        label: 'Ventas',
        path: '/sales',
        icon: IconCashRegister,
        allowedRoles: ['Admin', 'Reception'],
      },
      {
        label: 'Devoluciones',
        path: '/refunds',
        icon: IconReceiptRefund,
        allowedRoles: ['Admin', 'Reception'],
      },
      {
        label: 'Órdenes de compra',
        path: '/purchase-orders',
        icon: IconTruckDelivery,
        allowedRoles: ['Admin', 'Warehouse', 'Purchasing'],
      },
    ],
  },
  {
    label: 'Administración',
    items: [
      {
        label: 'Usuarios',
        path: '/users',
        icon: IconUserCog,
        allowedRoles: ['Admin'],
      },
      {
        label: 'Cierre de caja',
        path: '/cash-closing',
        icon: IconCash,
        allowedRoles: ['Admin'],
      },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        label: 'Notificaciones',
        path: '/notifications',
        icon: IconBell,
        allowedRoles: [
          'Admin',
          'Reception',
          'Mechanic',
          'Warehouse',
          'Purchasing',
          'ReadOnly',
        ],
      },
    ],
  },
];

export function getAllowedNavItems(role: RoleName) {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.allowedRoles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}

const allNavItems = navigationGroups.flatMap((group) => group.items);

export function isRouteAllowed(role: RoleName, path: string): boolean {
  const item = allNavItems.find(
    (navItem) => navItem.path === path || navItem.path === `/${path}`
  );
  if (!item) return true;
  return item.allowedRoles.includes(role);
}
