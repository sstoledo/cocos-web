import { RouteGuard } from '@/features/shell/components/RouteGuard';
import type { RoleName } from '@/features/shell/types';
import * as React from 'react';
import type { RouteObject } from 'react-router';

const ReceiptsPage = React.lazy(() =>
  import('./pages/ReceiptsPage').then((m) => ({
    default: m.ReceiptsPage,
  }))
);
const ReceiptDetailPage = React.lazy(() =>
  import('./pages/ReceiptDetailPage').then((m) => ({
    default: m.ReceiptDetailPage,
  }))
);

const RECEIPT_ROLES: RoleName[] = ['Admin', 'Purchasing', 'Warehouse'];

/* Shared Suspense boundary: each lazy receipt page suspends while its
   chunk loads, and keeps the guard inside the boundary. */
export const receiptRoutes: RouteObject[] = [
  {
    path: 'receipts',
    element: (
      <React.Suspense fallback="Cargando…">
        <RouteGuard routePath="/receipts" requiredRoles={RECEIPT_ROLES}>
          <ReceiptsPage />
        </RouteGuard>
      </React.Suspense>
    ),
  },
  {
    path: 'receipts/:id',
    element: (
      <React.Suspense fallback="Cargando…">
        <RouteGuard routePath="/receipts" requiredRoles={RECEIPT_ROLES}>
          <ReceiptDetailPage />
        </RouteGuard>
      </React.Suspense>
    ),
  },
];
