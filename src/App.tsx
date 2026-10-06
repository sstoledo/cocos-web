import { authRoutes } from '@/features/auth/routes';
import { BrandDetailPage } from '@/features/brands/pages/BrandDetailPage';
import { BrandFormPage } from '@/features/brands/pages/BrandFormPage';
import { BrandListPage } from '@/features/brands/pages/BrandListPage';
import { CashClosingDetailPage } from '@/features/cash-closings/pages/CashClosingDetailPage';
import { CashClosingsListPage } from '@/features/cash-closings/pages/CashClosingsListPage';
import { CloseCashClosingPage } from '@/features/cash-closings/pages/CloseCashClosingPage';
import { CategoryDetailPage } from '@/features/categories/pages/CategoryDetailPage';
import { CategoryFormPage } from '@/features/categories/pages/CategoryFormPage';
import { CategoryListPage } from '@/features/categories/pages/CategoryListPage';
import { ClientDetailPage } from '@/features/clients/pages/ClientDetailPage';
import { ClientFormPage } from '@/features/clients/pages/ClientFormPage';
import { ClientListPage } from '@/features/clients/pages/ClientListPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { LotFormPage } from '@/features/lots/pages/LotFormPage';
import { LotListPage } from '@/features/lots/pages/LotListPage';
import { NotificationListPage } from '@/features/notifications/pages/NotificationListPage';
import { PresentationFormPage } from '@/features/presentations/pages/PresentationFormPage';
import { PresentationListPage } from '@/features/presentations/pages/PresentationListPage';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage';
import { ProductFormPage } from '@/features/products/pages/ProductFormPage';
import { ProductListPage } from '@/features/products/pages/ProductListPage';
import { PurchaseOrderDetailPage } from '@/features/purchase-orders/pages/PurchaseOrderDetailPage';
import { PurchaseOrderFormPage } from '@/features/purchase-orders/pages/PurchaseOrderFormPage';
import { PurchaseOrderListPage } from '@/features/purchase-orders/pages/PurchaseOrderListPage';
import { PurchaseOrderReceivePage } from '@/features/purchase-orders/pages/PurchaseOrderReceivePage';
import { RefundPage } from '@/features/refunds/pages/RefundPage';
import { CheckoutPage } from '@/features/sales/pages/CheckoutPage';
import { SaleDetailPage } from '@/features/sales/pages/SaleDetailPage';
import { SalesListPage } from '@/features/sales/pages/SalesListPage';
import { ServiceDetailPage } from '@/features/services/pages/ServiceDetailPage';
import { ServiceFormPage } from '@/features/services/pages/ServiceFormPage';
import { ServiceListPage } from '@/features/services/pages/ServiceListPage';
import { RouteGuard } from '@/features/shell/components/RouteGuard';
import { Layout } from '@/features/shell/pages/Layout';
import { NotFoundPage } from '@/features/shell/pages/NotFoundPage';
import { UnauthorizedPage } from '@/features/shell/pages/UnauthorizedPage';
import type { RoleName } from '@/features/shell/types';
import { ProductStockPage } from '@/features/stock/pages/ProductStockPage';
import { SupplierDetailPage } from '@/features/suppliers/pages/SupplierDetailPage';
import { SupplierFormPage } from '@/features/suppliers/pages/SupplierFormPage';
import { SupplierListPage } from '@/features/suppliers/pages/SupplierListPage';
import { UserDetailPage } from '@/features/users/pages/UserDetailPage';
import { UserFormPage } from '@/features/users/pages/UserFormPage';
import { UserListPage } from '@/features/users/pages/UserListPage';
import { VehicleFormPage } from '@/features/vehicles/pages/VehicleFormPage';
import { VehicleListPage } from '@/features/vehicles/pages/VehicleListPage';
import { WorkOrderDetailPage } from '@/features/work-orders/pages/WorkOrderDetailPage';
import { WorkOrderFormPage } from '@/features/work-orders/pages/WorkOrderFormPage';
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
  requiredRole?: RoleName | RoleName[]
) {
  const roles = Array.isArray(requiredRole)
    ? requiredRole
    : requiredRole
      ? [requiredRole]
      : undefined;

  return {
    path,
    element: (
      <RouteGuard routePath={path} requiredRoles={roles}>
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
      guardedRoute('products/:id', <ProductDetailPage />),
      guardedRoute('products/new', <ProductFormPage />, 'Admin'),
      guardedRoute('products/:id/edit', <ProductFormPage />, 'Admin'),
      guardedRoute('products/:id/stock', <ProductStockPage />),
      guardedRoute('lots', <LotListPage />),
      guardedRoute('lots/new', <LotFormPage />),
      guardedRoute('clients', <ClientListPage />),
      guardedRoute('clients/:id', <ClientDetailPage />),
      guardedRoute('clients/new', <ClientFormPage />, ['Admin', 'Reception']),
      guardedRoute('clients/:id/edit', <ClientFormPage />, [
        'Admin',
        'Reception',
      ]),
      guardedRoute('services', <ServiceListPage />),
      guardedRoute('services/:id', <ServiceDetailPage />),
      guardedRoute('services/new', <ServiceFormPage />, ['Admin', 'Reception']),
      guardedRoute('services/:id/edit', <ServiceFormPage />, [
        'Admin',
        'Reception',
      ]),
      guardedRoute('vehicles', <VehicleListPage />),
      guardedRoute('vehicles/new', <VehicleFormPage />, ['Admin', 'Reception']),
      guardedRoute('vehicles/:id/edit', <VehicleFormPage />, [
        'Admin',
        'Reception',
      ]),
      guardedRoute('suppliers', <SupplierListPage />),
      guardedRoute('suppliers/new', <SupplierFormPage />, [
        'Admin',
        'Purchasing',
      ]),
      guardedRoute('suppliers/:id', <SupplierDetailPage />),

      guardedRoute('suppliers/:id/edit', <SupplierFormPage />, [
        'Admin',
        'Purchasing',
      ]),
      guardedRoute('brands', <BrandListPage />),
      guardedRoute('brands/:id', <BrandDetailPage />),
      guardedRoute('brands/new', <BrandFormPage />, 'Admin'),
      guardedRoute('brands/:id/edit', <BrandFormPage />, 'Admin'),
      guardedRoute('categories', <CategoryListPage />),
      guardedRoute('categories/:id', <CategoryDetailPage />),
      guardedRoute('categories/new', <CategoryFormPage />, 'Admin'),
      guardedRoute('categories/:id/edit', <CategoryFormPage />, 'Admin'),
      guardedRoute('presentations', <PresentationListPage />),
      guardedRoute('presentations/new', <PresentationFormPage />, 'Admin'),
      guardedRoute('presentations/:id/edit', <PresentationFormPage />, 'Admin'),
      guardedRoute('work-orders', <WorkOrderListPage />),
      guardedRoute('work-orders/new', <WorkOrderFormPage />, [
        'Admin',
        'Reception',
      ]),
      guardedRoute('work-orders/:id/edit', <WorkOrderFormPage />, [
        'Admin',
        'Reception',
      ]),
      guardedRoute('work-orders/:id', <WorkOrderDetailPage />),
      guardedRoute('sales', <SalesListPage />, ['Admin', 'Reception']),
      guardedRoute('sales/new', <CheckoutPage />, ['Admin', 'Reception']),
      guardedRoute('sales/:id', <SaleDetailPage />, ['Admin', 'Reception']),
      guardedRoute('refunds', <RefundPage />),
      guardedRoute('purchase-orders', <PurchaseOrderListPage />, [
        'Admin',
        'Purchasing',
        'Warehouse',
      ]),
      guardedRoute('purchase-orders/new', <PurchaseOrderFormPage />, [
        'Admin',
        'Purchasing',
      ]),
      guardedRoute('purchase-orders/:id', <PurchaseOrderDetailPage />, [
        'Admin',
        'Purchasing',
        'Warehouse',
      ]),
      guardedRoute('purchase-orders/:id/edit', <PurchaseOrderFormPage />, [
        'Admin',
        'Purchasing',
      ]),
      guardedRoute(
        'purchase-orders/:id/receive',
        <PurchaseOrderReceivePage />,
        ['Admin', 'Purchasing', 'Warehouse']
      ),
      guardedRoute('notifications', <NotificationListPage />),
      guardedRoute('users', <UserListPage />, 'Admin'),
      guardedRoute('users/:id', <UserDetailPage />, 'Admin'),
      guardedRoute('users/new', <UserFormPage />, 'Admin'),
      guardedRoute('users/:id/edit', <UserFormPage />, 'Admin'),
      guardedRoute('cash-closings', <CashClosingsListPage />, [
        'Admin',
        'Reception',
      ]),
      guardedRoute('cash-closings/close', <CloseCashClosingPage />, [
        'Admin',
        'Reception',
      ]),
      guardedRoute('cash-closings/:id', <CashClosingDetailPage />, [
        'Admin',
        'Reception',
      ]),
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export default function App() {
  return <RouterProvider router={router} />;
}
