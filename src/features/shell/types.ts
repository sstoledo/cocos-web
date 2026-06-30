import type { ComponentType } from 'react';

export type RoleName =
  | 'Admin'
  | 'Reception'
  | 'Mechanic'
  | 'Warehouse'
  | 'Purchasing'
  | 'ReadOnly';

export type User = {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: RoleName;
  };
};

export type NavItem = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  allowedRoles: RoleName[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};
