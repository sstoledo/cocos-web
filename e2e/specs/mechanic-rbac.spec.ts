import { type APIRequestContext, expect } from '@playwright/test';
import { test } from '@playwright/test';
import {
  MECHANIC_EMAIL,
  MECHANIC_EMPLOYEE_NAME,
  RECEPTION_EMAIL,
  apiSession,
  uiLogin,
} from '../helpers/session';

// RBAC scoping through the front stack: a Mechanic only sees work orders
// assigned to their linked employee (others 404 through the API), and the
// mechanic still cannot jump the transition matrix (409 for a forbidden
// target), even though the UI hides the buttons.

interface ListEnvelope<T> {
  data: T[];
}

test.describe
  .serial('Mechanic RBAC scoping', () => {
    let receptionApi: APIRequestContext;
    let clientId: string;
    let vehicleId: string;
    let employeeId: string;
    let assignedOrderNumber: string;
    let unassignedOrderNumber: string;
    let assignedOrderId: string;
    let unassignedOrderId: string;

    test.beforeAll(async () => {
      receptionApi = await apiSession(RECEPTION_EMAIL);

      const clientsResponse = await receptionApi.get(
        '/api/clients?query=Carlos'
      );
      expect(clientsResponse.ok()).toBeTruthy();
      const clients = (
        (await clientsResponse.json()) as ListEnvelope<{
          id: string;
          name: string;
        }>
      ).data;
      const seededClient = clients.find((c) => c.name === 'Carlos Mendoza');
      expect(
        seededClient,
        'seed-demo must include Carlos Mendoza'
      ).toBeDefined();
      if (!seededClient) throw new Error('Carlos Mendoza not found');
      clientId = seededClient.id;

      const vehiclesResponse = await receptionApi.get('/api/vehicles');
      expect(vehiclesResponse.ok()).toBeTruthy();
      const vehicles = (
        (await vehiclesResponse.json()) as ListEnvelope<{
          id: string;
          clientId: string;
        }>
      ).data;
      const seededVehicle = vehicles.find((v) => v.clientId === clientId);
      if (!seededVehicle) throw new Error('ABC-123 not found');
      vehicleId = seededVehicle.id;

      const employeesResponse = await receptionApi.get('/api/employees');
      expect(employeesResponse.ok()).toBeTruthy();
      // /api/employees returns a bare array; the other list endpoints wrap in
      // { data: [...] }.
      const employees = (await employeesResponse.json()) as Array<{
        id: string;
        name: string;
      }>;
      const mechanicEmployee = employees.find(
        (e) => e.name === MECHANIC_EMPLOYEE_NAME
      );
      expect(
        mechanicEmployee,
        'seed-e2e must have linked María González to the e2e mechanic'
      ).toBeDefined();
      if (!mechanicEmployee) {
        throw new Error('María González employee linkage missing');
      }
      employeeId = mechanicEmployee.id;

      const servicesResponse = await receptionApi.get('/api/services');
      expect(servicesResponse.ok()).toBeTruthy();
      const services = (
        (await servicesResponse.json()) as ListEnvelope<{
          id: string;
          name: string;
        }>
      ).data;
      const oilService = services.find((s) => /aceite/i.test(s.name));
      expect(oilService, 'seed-demo must include an oil service').toBeDefined();

      for (const config of [
        { employeeId, expectedNumber: 'assigned' },
        { employeeId: undefined, expectedNumber: 'unassigned' },
      ] as const) {
        const response = await receptionApi.post('/api/work-orders', {
          data: {
            clientId,
            vehicleId,
            employeeId: config.employeeId,
            services: [
              { serviceId: oilService?.id ?? '', quantity: 1, unitPrice: '60.00' },
            ],
          },
        });
        expect(response.ok()).toBeTruthy();
        const body = (await response.json()) as {
          id: string;
          orderNumber: string;
        };
        if (config.expectedNumber === 'assigned') {
          assignedOrderNumber = body.orderNumber;
          assignedOrderId = body.id;
        } else {
          unassignedOrderNumber = body.orderNumber;
          unassignedOrderId = body.id;
        }
      }
    });

    test.afterAll(async () => {
      await receptionApi?.dispose();
    });

    test('mechanic list shows only the assigned order', async ({ page }) => {
      await uiLogin(page, MECHANIC_EMAIL);
      await page.goto('/work-orders');
      await expect(page.locator('body')).toContainText(assignedOrderNumber, {
        timeout: 15_000,
      });
      await expect(page.locator('body')).not.toContainText(
        unassignedOrderNumber
      );
    });

    test('forbidden transition on the assigned order is rejected with 409', async () => {
      // The assigned order stays pending; a mechanic asking for pending→done is
      // outside the transition matrix (allowed: pending→in_progress only), so
      // the API must reject it with 409 for any role.
      const mechanicApi = await apiSession(MECHANIC_EMAIL);
      try {
        const response = await mechanicApi.patch(
          `/api/work-orders/${assignedOrderId}/status`,
          { data: { status: 'done' } }
        );
        expect(response.status()).toBe(409);
        const body = (await response.json()) as { errorCode?: string };
        expect(body.errorCode).toBe('INVALID_STATUS_TRANSITION');
      } finally {
        await mechanicApi.dispose();
      }
    });

    test('unassigned order is invisible to the mechanic through the API', async () => {
      const mechanicApi = await apiSession(MECHANIC_EMAIL);
      try {
        const response = await mechanicApi.get(
          `/api/work-orders/${unassignedOrderId}`
        );
        expect(response.status()).toBe(404);
      } finally {
        await mechanicApi.dispose();
      }
    });
  });
