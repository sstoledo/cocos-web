import { RouteGuard } from '@/features/shell/components/RouteGuard';
import type { RoleName } from '@/features/shell/types';
import type { RouteObject } from 'react-router';
import { ReceiptDetailPage } from './pages/ReceiptDetailPage';
import { ReceiptsPage } from './pages/ReceiptsPage';

const RECEIPT_ROLES: RoleName[] = ['Admin', 'Purchasing', 'Warehouse'];

export const receiptRoutes: RouteObject[] = [
  {
    path: 'receipts',
    element: (
      <RouteGuard routePath="/receipts" requiredRoles={RECEIPT_ROLES}>
        <ReceiptsPage />
      </RouteGuard>
    ),
  },
  {
    path: 'receipts/:id',
    element: (
      <RouteGuard routePath="/receipts" requiredRoles={RECEIPT_ROLES}>
        <ReceiptDetailPage />
      </RouteGuard>
    ),
  },
];
