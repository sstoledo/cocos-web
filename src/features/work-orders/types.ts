import type { PaymentMethod } from '@/features/sales/types';

export type WorkOrderStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';

export type WorkOrderPaymentStatus = 'pending' | 'partial' | 'paid';

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
  paidAmount: string;
  paymentStatus: WorkOrderPaymentStatus;
  isActive: boolean;
  employee: NamedSummary | null;
  branch: NamedSummary | null;
  services: WorkOrderServiceLine[];
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

export interface CreateWorkOrderPayload {
  clientId: string;
  vehicleId: string;
  description?: string;
  employeeId?: string | null;
  services?: WorkOrderServiceLineInput[];
}

export type UpdateWorkOrderPayload = CreateWorkOrderPayload;

export interface WorkOrderPayment {
  id: string;
  workOrderId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  note: string | null;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkOrderPaymentPayload {
  amount: string;
  paymentMethod: PaymentMethod;
  note?: string;
}

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
