// Types transcribed from the B11 dashboard summary backend contract
// (obs #1278 + #1286). Do NOT invent new shapes here.
// All counts are plain numbers (no money, per B12 decision).
export interface WorkOrdersSummary {
  pending: number;
  inProgress: number;
  done: number;
  cancelled: number;
}

export interface PurchaseOrdersSummary {
  draft: number;
  ordered: number;
  partiallyReceived: number;
  received: number;
  cancelled: number;
}

export interface DashboardSummary {
  salesTodayCount: number;
  salesMonthCount: number;
  workOrders: WorkOrdersSummary;
  purchaseOrders: PurchaseOrdersSummary;
  notificationsUnread: number;
  generatedAt: string;
}
