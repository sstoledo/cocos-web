import { authRoutes } from '@/features/auth/routes';
import { receiptRoutes } from '@/features/receipts/routes';
import { RoleBasedIndex } from '@/features/shell/components/RoleBasedIndex';
import { RouteGuard } from '@/features/shell/components/RouteGuard';
import { Layout } from '@/features/shell/pages/Layout';
import { NotFoundPage } from '@/features/shell/pages/NotFoundPage';
import { UnauthorizedPage } from '@/features/shell/pages/UnauthorizedPage';
import type { RoleName } from '@/features/shell/types';
import { IconLoader2 } from '@tabler/icons-react';
import * as React from 'react';
import {
  type RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router';

/* Lazy feature pages keep the initial bundle small: each route loads its
   page on first navigation. React.lazy requires a default export, so each
   import adapts the eager named export without touching feature files. */
const BrandDetailPage = React.lazy(() =>
  import('@/features/brands/pages/BrandDetailPage').then((m) => ({
    default: m.BrandDetailPage,
  }))
);
const BrandFormPage = React.lazy(() =>
  import('@/features/brands/pages/BrandFormPage').then((m) => ({
    default: m.BrandFormPage,
  }))
);
const BrandListPage = React.lazy(() =>
  import('@/features/brands/pages/BrandListPage').then((m) => ({
    default: m.BrandListPage,
  }))
);
const CashClosingDetailPage = React.lazy(() =>
  import('@/features/cash-closings/pages/CashClosingDetailPage').then((m) => ({
    default: m.CashClosingDetailPage,
  }))
);
const CashClosingsListPage = React.lazy(() =>
  import('@/features/cash-closings/pages/CashClosingsListPage').then((m) => ({
    default: m.CashClosingsListPage,
  }))
);
const CloseCashClosingPage = React.lazy(() =>
  import('@/features/cash-closings/pages/CloseCashClosingPage').then((m) => ({
    default: m.CloseCashClosingPage,
  }))
);
const CategoryDetailPage = React.lazy(() =>
  import('@/features/categories/pages/CategoryDetailPage').then((m) => ({
    default: m.CategoryDetailPage,
  }))
);
const CategoryFormPage = React.lazy(() =>
  import('@/features/categories/pages/CategoryFormPage').then((m) => ({
    default: m.CategoryFormPage,
  }))
);
const CategoryListPage = React.lazy(() =>
  import('@/features/categories/pages/CategoryListPage').then((m) => ({
    default: m.CategoryListPage,
  }))
);
const ClientDetailPage = React.lazy(() =>
  import('@/features/clients/pages/ClientDetailPage').then((m) => ({
    default: m.ClientDetailPage,
  }))
);
const ClientFormPage = React.lazy(() =>
  import('@/features/clients/pages/ClientFormPage').then((m) => ({
    default: m.ClientFormPage,
  }))
);
const ClientListPage = React.lazy(() =>
  import('@/features/clients/pages/ClientListPage').then((m) => ({
    default: m.ClientListPage,
  }))
);
const DashboardPage = React.lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  }))
);
const LotFormPage = React.lazy(() =>
  import('@/features/lots/pages/LotFormPage').then((m) => ({
    default: m.LotFormPage,
  }))
);
const LotListPage = React.lazy(() =>
  import('@/features/lots/pages/LotListPage').then((m) => ({
    default: m.LotListPage,
  }))
);
const NotificationListPage = React.lazy(() =>
  import('@/features/notifications/pages/NotificationListPage').then((m) => ({
    default: m.NotificationListPage,
  }))
);
const PresentationFormPage = React.lazy(() =>
  import('@/features/presentations/pages/PresentationFormPage').then((m) => ({
    default: m.PresentationFormPage,
  }))
);
const PresentationListPage = React.lazy(() =>
  import('@/features/presentations/pages/PresentationListPage').then((m) => ({
    default: m.PresentationListPage,
  }))
);
const ProductDetailPage = React.lazy(() =>
  import('@/features/products/pages/ProductDetailPage').then((m) => ({
    default: m.ProductDetailPage,
  }))
);
const ProductFormPage = React.lazy(() =>
  import('@/features/products/pages/ProductFormPage').then((m) => ({
    default: m.ProductFormPage,
  }))
);
const ProductListPage = React.lazy(() =>
  import('@/features/products/pages/ProductListPage').then((m) => ({
    default: m.ProductListPage,
  }))
);
const ProformaDetailPage = React.lazy(() =>
  import('@/features/proformas/pages/ProformaDetailPage').then((m) => ({
    default: m.ProformaDetailPage,
  }))
);
const ProformaFormPage = React.lazy(() =>
  import('@/features/proformas/pages/ProformaFormPage').then((m) => ({
    default: m.ProformaFormPage,
  }))
);
const ProformasListPage = React.lazy(() =>
  import('@/features/proformas/pages/ProformasListPage').then((m) => ({
    default: m.ProformasListPage,
  }))
);
const PurchaseOrderDetailPage = React.lazy(() =>
  import('@/features/purchase-orders/pages/PurchaseOrderDetailPage').then(
    (m) => ({
      default: m.PurchaseOrderDetailPage,
    })
  )
);
const PurchaseOrderFormPage = React.lazy(() =>
  import('@/features/purchase-orders/pages/PurchaseOrderFormPage').then(
    (m) => ({
      default: m.PurchaseOrderFormPage,
    })
  )
);
const PurchaseOrderListPage = React.lazy(() =>
  import('@/features/purchase-orders/pages/PurchaseOrderListPage').then(
    (m) => ({
      default: m.PurchaseOrderListPage,
    })
  )
);
const PurchaseOrderReceivePage = React.lazy(() =>
  import('@/features/purchase-orders/pages/PurchaseOrderReceivePage').then(
    (m) => ({
      default: m.PurchaseOrderReceivePage,
    })
  )
);
const RefundPage = React.lazy(() =>
  import('@/features/refunds/pages/RefundPage').then((m) => ({
    default: m.RefundPage,
  }))
);
const CheckoutPage = React.lazy(() =>
  import('@/features/sales/pages/CheckoutPage').then((m) => ({
    default: m.CheckoutPage,
  }))
);
const SaleDetailPage = React.lazy(() =>
  import('@/features/sales/pages/SaleDetailPage').then((m) => ({
    default: m.SaleDetailPage,
  }))
);
const SalesListPage = React.lazy(() =>
  import('@/features/sales/pages/SalesListPage').then((m) => ({
    default: m.SalesListPage,
  }))
);
const ServiceDetailPage = React.lazy(() =>
  import('@/features/services/pages/ServiceDetailPage').then((m) => ({
    default: m.ServiceDetailPage,
  }))
);
const ServiceFormPage = React.lazy(() =>
  import('@/features/services/pages/ServiceFormPage').then((m) => ({
    default: m.ServiceFormPage,
  }))
);
const ServiceListPage = React.lazy(() =>
  import('@/features/services/pages/ServiceListPage').then((m) => ({
    default: m.ServiceListPage,
  }))
);
const ProfilePage = React.lazy(() =>
  import('@/features/shell/pages/ProfilePage').then((m) => ({
    default: m.ProfilePage,
  }))
);
const ProductStockPage = React.lazy(() =>
  import('@/features/stock/pages/ProductStockPage').then((m) => ({
    default: m.ProductStockPage,
  }))
);
const SupplierDetailPage = React.lazy(() =>
  import('@/features/suppliers/pages/SupplierDetailPage').then((m) => ({
    default: m.SupplierDetailPage,
  }))
);
const SupplierFormPage = React.lazy(() =>
  import('@/features/suppliers/pages/SupplierFormPage').then((m) => ({
    default: m.SupplierFormPage,
  }))
);
const SupplierListPage = React.lazy(() =>
  import('@/features/suppliers/pages/SupplierListPage').then((m) => ({
    default: m.SupplierListPage,
  }))
);
const UserDetailPage = React.lazy(() =>
  import('@/features/users/pages/UserDetailPage').then((m) => ({
    default: m.UserDetailPage,
  }))
);
const UserFormPage = React.lazy(() =>
  import('@/features/users/pages/UserFormPage').then((m) => ({
    default: m.UserFormPage,
  }))
);
const UserListPage = React.lazy(() =>
  import('@/features/users/pages/UserListPage').then((m) => ({
    default: m.UserListPage,
  }))
);
const VehicleFormPage = React.lazy(() =>
  import('@/features/vehicles/pages/VehicleFormPage').then((m) => ({
    default: m.VehicleFormPage,
  }))
);
const VehicleListPage = React.lazy(() =>
  import('@/features/vehicles/pages/VehicleListPage').then((m) => ({
    default: m.VehicleListPage,
  }))
);
const WorkOrderDetailPage = React.lazy(() =>
  import('@/features/work-orders/pages/WorkOrderDetailPage').then((m) => ({
    default: m.WorkOrderDetailPage,
  }))
);
const WorkOrderFormPage = React.lazy(() =>
  import('@/features/work-orders/pages/WorkOrderFormPage').then((m) => ({
    default: m.WorkOrderFormPage,
  }))
);
const WorkOrderListPage = React.lazy(() =>
  import('@/features/work-orders/pages/WorkOrderListPage').then((m) => ({
    default: m.WorkOrderListPage,
  }))
);

function PageLoader() {
  return (
    <output
      aria-busy="true"
      aria-label="Cargando página"
      className="flex items-center justify-center gap-2 py-16 text-muted-foreground"
    >
      <IconLoader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      Cargando…
    </output>
  );
}

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
      <React.Suspense fallback={<PageLoader />}>
        <RouteGuard routePath={path} requiredRoles={roles}>
          {element}
        </RouteGuard>
      </React.Suspense>
    ),
  };
}

const routes: RouteObject[] = [
  ...authRoutes,
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <RoleBasedIndex /> },
      guardedRoute('dashboard', <DashboardPage />),
      guardedRoute('products', <ProductListPage />),
      guardedRoute('products/:id', <ProductDetailPage />),
      guardedRoute('products/new', <ProductFormPage />, ['Admin', 'Warehouse']),
      guardedRoute('products/:id/edit', <ProductFormPage />, [
        'Admin',
        'Warehouse',
      ]),
      guardedRoute('products/:id/stock', <ProductStockPage />),
      guardedRoute('lots', <LotListPage />),
      guardedRoute('lots/new', <LotFormPage />),
      ...receiptRoutes,
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
      guardedRoute('proformas', <ProformasListPage />, ['Admin', 'Reception']),
      guardedRoute('proformas/new', <ProformaFormPage />, [
        'Admin',
        'Reception',
      ]),
      guardedRoute('proformas/:id', <ProformaDetailPage />, [
        'Admin',
        'Reception',
      ]),
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
      guardedRoute('profile', <ProfilePage />),
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
