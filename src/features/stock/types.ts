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
