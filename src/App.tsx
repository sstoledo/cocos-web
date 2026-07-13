import { authRoutes } from '@/features/auth/routes';
import { CashClosingPage } from '@/features/cash-register/pages/CashClosingPage';
import { ClientListPage } from '@/features/clients/pages/ClientListPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { LotFormPage } from '@/features/lots/pages/LotFormPage';
import { LotListPage } from '@/features/lots/pages/LotListPage';
import { NotificationListPage } from '@/features/notifications/pages/NotificationListPage';
import { ProductFormPage } from '@/features/products/pages/ProductFormPage';
import { ProductListPage } from '@/features/products/pages/ProductListPage';
import { PurchaseOrderListPage } from '@/features/purchase-orders/pages/PurchaseOrderListPage';
import { RefundPage } from '@/features/refunds/pages/RefundPage';
import { SalesPage } from '@/features/sales/pages/SalesPage';
import { ServiceListPage } from '@/features/services/pages/ServiceListPage';
import { RouteGuard } from '@/features/shell/components/RouteGuard';
import { Layout } from '@/features/shell/pages/Layout';
import { NotFoundPage } from '@/features/shell/pages/NotFoundPage';
import { UnauthorizedPage } from '@/features/shell/pages/UnauthorizedPage';
import type { RoleName } from '@/features/shell/types';
import { ProductStockPage } from '@/features/stock/pages/ProductStockPage';
import { UserListPage } from '@/features/users/pages/UserListPage';
import { WorkOrderListPage } from '@/features/work-orders/pages/WorkOrderListPage';
import * as React from 'react';
import {
  Navigate,
  type RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router';

function guardedRoute(
  path: string,
  element: React.ReactNode,
  requiredRole?: RoleName
) {
  return {
    path,
    element: (
      <RouteGuard routePath={path} requiredRole={requiredRole}>
        {element}
      </RouteGuard>
    ),
  };
}

const routes: RouteObject[] = [
  ...authRoutes,
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      guardedRoute('dashboard', <DashboardPage />),
      guardedRoute('products', <ProductListPage />),
      guardedRoute('products/new', <ProductFormPage />, 'Admin'),
      guardedRoute('products/:id/edit', <ProductFormPage />, 'Admin'),
      guardedRoute('products/:id/stock', <ProductStockPage />),
      guardedRoute('lots', <LotListPage />),
      guardedRoute('lots/new', <LotFormPage />),
      guardedRoute('clients', <ClientListPage />),
      guardedRoute('services', <ServiceListPage />),
      guardedRoute('work-orders', <WorkOrderListPage />),
      guardedRoute('sales', <SalesPage />),
      guardedRoute('refunds', <RefundPage />),
      guardedRoute('purchase-orders', <PurchaseOrderListPage />),
      guardedRoute('notifications', <NotificationListPage />),
      guardedRoute('users', <UserListPage />),
      guardedRoute('cash-closing', <CashClosingPage />),
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export default function App() {
  return <RouterProvider router={router} />;
}
