import type { Client, Vehicle } from '@/features/clients/types';
import type { Service } from '@/features/services/types';
import type { WorkOrder, WorkOrderServiceLine } from '../types';

export function buildClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 'c1',
    name: 'Juan Pérez',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function buildVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    clientId: 'c1',
    isActive: true,
    ...overrides,
  };
}

export function buildService(overrides: Partial<Service> = {}): Service {
  return {
    id: 's1',
    code: 'SRV-001',
    name: 'Cambio de aceite',
    price: '150.00',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function buildWorkOrderServiceLine(
  overrides: Partial<WorkOrderServiceLine> = {}
): WorkOrderServiceLine {
  const service = buildService();
  return {
    id: 'wos1',
    serviceId: service.id,
    quantity: 2,
    unitPriceSnapshot: service.price,
    subtotal: '300.00',
    service,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function buildWorkOrder(overrides: Partial<WorkOrder> = {}): WorkOrder {
  return {
    id: 'wo1',
    orderNumber: 'OT-0001',
    clientId: 'c1',
    vehicleId: 'v1',
    client: { id: 'c1', name: 'Juan Pérez' },
    vehicle: { id: 'v1', plate: 'ABC123', brand: 'Toyota', model: 'Corolla' },
    description: null,
    status: 'pending',
    totalAmount: '300.00',
    paidAmount: '0.00',
    paymentStatus: 'pending',
    isActive: true,
    employee: null,
    branch: null,
    services: [buildWorkOrderServiceLine()],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}
