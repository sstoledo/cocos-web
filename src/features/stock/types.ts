export interface ProductStock {
  productId: string;
  stock: number;
}

export interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  reason?: string;
  createdAt: string;
  lotItem?: {
    lot: {
      lotNumber: string;
    };
  };
}

export interface StockAdjustmentFormValues {
  quantity: number;
  reason?: string;
}

export interface OpenContainersInfo {
  productId: string;
  openContainers: number;
  lastOpened: {
    workOrderId: string;
    workOrderNumber: string;
    registeredBy: { id: string; name: string };
    createdAt: string;
  } | null;
}
