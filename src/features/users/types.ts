export type RoleName =
  | 'Admin'
  | 'Reception'
  | 'Mechanic'
  | 'Warehouse'
  | 'Purchasing'
  | 'ReadOnly';

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: {
    id: string;
    name: RoleName;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserListFilters {
  q?: string;
  roleId?: string;
  isActive?: 'true' | 'false';
  page?: number;
  limit?: number;
}

export interface UserListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface UserListResponse {
  data: User[];
  meta: UserListMeta;
}

export type { UserFormValues } from './schemas/user-schema';
export type { UserUpdateValues } from './schemas/user-update-schema';
export type { AssignRoleValues } from './schemas/assign-role-schema';
