export interface Role {
  id: string;
  name:
    | 'Admin'
    | 'Reception'
    | 'Mechanic'
    | 'Warehouse'
    | 'Purchasing'
    | 'ReadOnly';
}
