export type WorkOrderStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';

export interface NamedSummary {
  id: string;
  name: string;
}

export interface ClientSummary {
  id: string;
  name: string;
}

export interface VehicleSummary {
  id: string;
  plate: string;
  brand: string;
  model: string;
}

export interface WorkOrderServiceLine {
  id: string;
  serviceId: string;
  quantity: number;
  unitPriceSnapshot: string;
  subtotal: string;
  service: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    price: string;
    estimatedDuration?: number | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderProductLine {
  id: string;
  productId: string;
  quantity: number;
  unitPriceSnapshot: string;
  subtotal: string;
  product: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    price: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  vehicleId: string;
  client: ClientSummary;
  vehicle: VehicleSummary;
  description?: string | null;
  status: WorkOrderStatus;
  totalAmount: string;
  isActive: boolean;
  employee: NamedSummary | null;
  branch: NamedSummary | null;
  services: WorkOrderServiceLine[];
  products: WorkOrderProductLine[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface WorkOrderLineInput {
  quantity: number;
  unitPrice?: number;
}

export interface WorkOrderServiceLineInput extends WorkOrderLineInput {
  serviceId: string;
}

export interface WorkOrderProductLineInput extends WorkOrderLineInput {
  productId: string;
}

export interface CreateWorkOrderPayload {
  clientId: string;
  vehicleId: string;
  description?: string;
  services?: WorkOrderServiceLineInput[];
  products?: WorkOrderProductLineInput[];
}

export type UpdateWorkOrderPayload = CreateWorkOrderPayload;

export interface WorkOrderListFilters {
  query?: string;
  page?: number;
  limit?: number;
}

export interface WorkOrderListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface WorkOrderListResponse {
  data: WorkOrder[];
  meta: WorkOrderListMeta;
}
